import { useEffect, useState } from "react";
import { estadoCancelacion } from "../utils/cancelacionReservas";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useMisReservasQuery, useFuncionesQuery, usePeliculasQuery, useCancelarReservaMutation } from "../services/reservasApi";
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
  const [ahora, setAhora] = useState(Date.now);
  useEffect(() => {
    const actualizar = () => setAhora(Date.now());
    const reloj = setInterval(actualizar, 1000);
    window.addEventListener("focus", actualizar);
    return () => { clearInterval(reloj); window.removeEventListener("focus", actualizar); };
  }, []);
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
      <p role="alert">{error.status === 401 ? "Iniciá sesión nuevamente para consultar tus reservas." : error.status === 403 ? "No tenés permisos para consultar estas reservas." : "Ocurrió un problema al consultar el servidor. Intentá nuevamente."}</p>
      {error.status === 401
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
              <TarjetaReserva reserva={reserva} funcion={funcion} pelicula={pelicula} ahora={ahora} />
            </li>
          );
        })}
      </ul>
    </>
  );
}

function TarjetaReserva({ reserva, funcion, pelicula, ahora }) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");
  const [cancelarReserva, { isLoading, data: cancelada }] = useCancelarReservaMutation();
  const { notificar } = useNotificaciones();
  const actual = cancelada?.estado === "CANCELADA" ? { ...reserva, estado: "CANCELADA" } : reserva;
  const cancelacion = estadoCancelacion(actual, funcion, ahora);
  const butacas = Array.isArray(reserva.asientos) ? reserva.asientos : [];

  async function confirmarCancelacion() {
    if (isLoading) return;
    const vigente = estadoCancelacion(actual, funcion);
    if (!vigente.permitido) { setError(vigente.motivo); return; }
    setError("");
    try {
      await cancelarReserva({ idReserva: reserva.idReserva, funcionId: reserva.idFuncion }).unwrap();
      setConfirmando(false);
      notificar("Reserva cancelada. Las butacas quedaron disponibles.");
    } catch (err) { setError(err.message || "No pudimos cancelar la reserva. Intentá nuevamente."); }
  }

  return (
    <article className="reserva-panel mis-reservas-tarjeta" aria-labelledby={`reserva-${reserva.idReserva}`}>
      <div className="mis-reservas-tarjeta-cabecera">
        <div><p className="mis-reservas-numero">Reserva #{reserva.idReserva}</p><h2 id={`reserva-${reserva.idReserva}`}>{pelicula?.titulo || `Función #${reserva.idFuncion}`}</h2></div>
        <span className={`mis-reservas-estado mis-reservas-estado--${actual.estado?.toLowerCase()}`}>{estados[actual.estado] || actual.estado || "Estado no disponible"}</span>
      </div>
      <dl className="mis-reservas-datos">
        <div><dt>Función</dt><dd>{fecha(funcion?.horarioInicio)}</dd></div>
        <div><dt>Sala</dt><dd>{funcion?.salaNombre || "No disponible"}</dd></div>
        <div><dt>Entradas</dt><dd>{reserva.idsEntradas?.length ?? (butacas.length || "No disponible")}</dd></div>
        <div><dt>Reservada el</dt><dd>{fecha(reserva.fechaReserva)}</dd></div>
        <div><dt>Butacas</dt><dd>{butacas.length ? [...butacas].sort((a, b) => String(a.fila).localeCompare(String(b.fila)) || a.numero - b.numero).map((a) => `${a.fila}${a.numero}`).join(", ") : "No disponibles"}</dd></div>
      </dl>
      <div className="mis-reservas-total"><span>Total de la reserva</span><strong>{reserva.total != null && Number.isFinite(Number(reserva.total)) ? moneda.format(Number(reserva.total)) : "No disponible"}</strong></div>
      <div className="mis-reservas-cancelacion">
        <p id={`plazo-${reserva.idReserva}`}>{cancelacion.permitido ? `Podés cancelar hasta el ${fecha(cancelacion.limite)}.` : cancelacion.motivo}</p>
        {!confirmando && cancelacion.permitido && <button className="mis-reservas-accion mis-reservas-accion--cancelar" aria-describedby={`plazo-${reserva.idReserva}`} onClick={() => { setError(""); setConfirmando(true); }}>Cancelar reserva</button>}
        {confirmando && actual.estado !== "CANCELADA" && <div className="mis-reservas-confirmacion" role="group" aria-labelledby={`confirmacion-${reserva.idReserva}`} aria-busy={isLoading}>
          <p id={`confirmacion-${reserva.idReserva}`}><strong>¿Cancelar la reserva #{reserva.idReserva}?</strong> Se liberarán todas sus butacas. Esta acción no se puede deshacer.</p>
          <div className="mis-reservas-botones">
            <button className="mis-reservas-accion" disabled={isLoading} onClick={() => { setConfirmando(false); setError(""); }}>Conservar reserva</button>
            <button className="mis-reservas-accion mis-reservas-accion--cancelar" disabled={isLoading || !cancelacion.permitido} onClick={confirmarCancelacion}>{isLoading ? "Cancelando..." : "Sí, cancelar reserva"}</button>
          </div>
        </div>}
        {error && <p role="alert">{error}</p>}
      </div>
    </article>
  );
}
