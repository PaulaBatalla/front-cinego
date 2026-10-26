import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { reservaService } from "../services/reservaService";
import "../styles/reserva.css";
import "../styles/misReservas.css";

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const estados = { PENDIENTE: "Pendiente", CONFIRMADA: "Confirmada", CANCELADA: "Cancelada" };

function fecha(valor) {
  if (!valor || Number.isNaN(new Date(valor).getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(valor));
}

export default function MisReservas() {
  const { isAuthenticated, token } = useAuth();
  return (
    <section className="reserva-page mis-reservas" aria-labelledby="mis-reservas-titulo">
      <Link className="reserva-volver" to="/">← Volver a la cartelera</Link>
      <header className="mis-reservas-cabecera">
        <div><h1 id="mis-reservas-titulo">Mis reservas</h1><p>Todos tus planes de cine, en un solo lugar.</p></div>
        {isAuthenticated && <Link className="mis-reservas-accion" to="/reservas">Reservar entradas</Link>}
      </header>
      {isAuthenticated ? <ListadoReservas key={token} /> : (
        <div className="reserva-panel mis-reservas-mensaje">
          <h2>Tus reservas te esperan</h2>
          <p>Iniciá sesión para consultar tus reservas.</p>
          <Link className="mis-reservas-accion" to="/login" state={{ volverA: "/mis-reservas" }}>Iniciar sesión</Link>
        </div>
      )}
    </section>
  );
}

function ListadoReservas() {
  const { logout } = useAuth();
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    const controller = new AbortController();
    async function cargar() {
      try {
        const reservas = await reservaService.misReservas(controller.signal);
        if (!activo) return;
        if (!Array.isArray(reservas)) throw new Error("La respuesta de reservas no es válida.");
        const catalogos = reservas.length ? await Promise.allSettled([
          reservaService.funciones(controller.signal),
          reservaService.peliculas(controller.signal),
        ]) : [];
        if (!activo) return;
        setResultado({
          reservas: [...reservas].sort((a, b) => (Date.parse(b.fechaReserva) || 0) - (Date.parse(a.fechaReserva) || 0) || b.idReserva - a.idReserva),
          funciones: catalogos[0]?.status === "fulfilled" && Array.isArray(catalogos[0].value) ? catalogos[0].value : [],
          peliculas: catalogos[1]?.status === "fulfilled" && Array.isArray(catalogos[1].value) ? catalogos[1].value : [],
          incompleto: catalogos.some((catalogo) => catalogo.status === "rejected"),
        });
      } catch (err) {
        if (activo) setError(err);
      }
    }
    cargar();
    return () => { activo = false; controller.abort(); };
  }, [intento]);

  if (error) return (
    <div className="reserva-panel mis-reservas-mensaje">
      <h2>No pudimos cargar tus reservas</h2>
      <p role="alert">{[401, 403].includes(error.status) ? "Iniciá sesión nuevamente para consultar tus reservas." : "Ocurrió un problema al consultar el servidor. Intentá nuevamente."}</p>
      {[401, 403].includes(error.status)
        ? <Link className="mis-reservas-accion" to="/login" state={{ volverA: "/mis-reservas" }} onClick={logout}>Iniciar sesión</Link>
        : <button className="mis-reservas-accion" type="button" onClick={() => { setError(null); setIntento((valor) => valor + 1); }}>Reintentar</button>}
    </div>
  );
  if (!resultado) return <p className="reserva-panel" role="status">Cargando tus reservas…</p>;
  if (!resultado.reservas.length) return (
    <div className="reserva-panel mis-reservas-mensaje">
      <h2>Todavía no tenés reservas</h2>
      <p>Elegí una película y preparate para tu próxima salida al cine.</p>
      <Link className="mis-reservas-accion" to="/">Explorar cartelera</Link>
    </div>
  );

  return (
    <>
      <p className="mis-reservas-cantidad" role="status">{resultado.reservas.length} {resultado.reservas.length === 1 ? "reserva" : "reservas"} · Más recientes primero</p>
      {resultado.incompleto && <p className="mis-reservas-aviso">Algunos datos de las películas o funciones no están disponibles. Tus reservas se muestran igualmente.</p>}
      <ul className="mis-reservas-lista">
        {resultado.reservas.map((reserva) => {
          const funcion = resultado.funciones.find((item) => String(item.id) === String(reserva.idFuncion));
          const pelicula = resultado.peliculas.find((item) => String(item.id) === String(funcion?.peliculaId));
          return (
            <li key={reserva.idReserva}>
              <article className="reserva-panel mis-reservas-tarjeta" aria-labelledby={`reserva-${reserva.idReserva}`}>
                <div className="mis-reservas-tarjeta-cabecera">
                  <div><p className="mis-reservas-numero">Reserva #{reserva.idReserva}</p><h2 id={`reserva-${reserva.idReserva}`}>{pelicula?.titulo || `Función #${reserva.idFuncion}`}</h2></div>
                  <span className={`mis-reservas-estado mis-reservas-estado--${reserva.estado?.toLowerCase()}`}>{estados[reserva.estado] || reserva.estado || "Estado no disponible"}</span>
                </div>
                <dl className="mis-reservas-datos">
                  <div><dt>Función</dt><dd>{fecha(funcion?.horarioInicio)}</dd></div>
                  <div><dt>Sala</dt><dd>{funcion?.salaNombre || "No disponible"}</dd></div>
                  <div><dt>Entradas</dt><dd>{reserva.idsEntradas?.length ?? "No disponible"}</dd></div>
                  <div><dt>Reservada el</dt><dd>{fecha(reserva.fechaReserva)}</dd></div>
                </dl>
                <div className="mis-reservas-total"><span>Total de la reserva</span><strong>{reserva.total != null && Number.isFinite(Number(reserva.total)) ? moneda.format(Number(reserva.total)) : "No disponible"}</strong></div>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
