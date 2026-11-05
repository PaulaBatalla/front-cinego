import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMisReservasQuery, useFuncionesQuery, usePeliculasQuery } from "../services/reservasApi";
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
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ volverA: "/mis-reservas" }} />;
  }
  return (
    <section className="reserva-page mis-reservas" aria-labelledby="mis-reservas-titulo">
      <Link className="reserva-volver" to="/">← Volver a la cartelera</Link>
      <header className="mis-reservas-cabecera">
        <div><h1 id="mis-reservas-titulo">Mis reservas</h1><p>Todos tus planes de cine, en un solo lugar.</p></div>
        <Link className="mis-reservas-accion" to="/">Reservar entradas</Link>
      </header>
      <ListadoReservas key={token} />
    </section>
  );
}

function ListadoReservas() {
  const { logout } = useAuth();
  const reservas = useMisReservasQuery(undefined, { refetchOnMountOrArgChange: true });
  const consultarCatalogos = Boolean(reservas.data?.length);
  const funciones = useFuncionesQuery(undefined, { skip: !consultarCatalogos });
  const peliculas = usePeliculasQuery(undefined, { skip: !consultarCatalogos });
  const error = reservas.error;
  const resultado = reservas.data && !funciones.isLoading && !peliculas.isLoading ? {
    reservas: [...reservas.data].sort((a, b) => (Date.parse(b.fechaReserva) || 0) - (Date.parse(a.fechaReserva) || 0) || b.idReserva - a.idReserva),
    funciones: funciones.data || [],
    peliculas: peliculas.data || [],
    incompleto: Boolean(funciones.error || peliculas.error),
  } : null;

  if (error) return (
    <div className="reserva-panel mis-reservas-mensaje">
      <h2>No pudimos cargar tus reservas</h2>
      <p role="alert">{[401, 403].includes(error.status) ? "Iniciá sesión nuevamente para consultar tus reservas." : "Ocurrió un problema al consultar el servidor. Intentá nuevamente."}</p>
      {[401, 403].includes(error.status)
        ? <Link className="mis-reservas-accion" to="/login" state={{ volverA: "/mis-reservas" }} onClick={logout}>Iniciar sesión</Link>
        : <button className="mis-reservas-accion" type="button" onClick={reservas.refetch}>Reintentar</button>}
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
