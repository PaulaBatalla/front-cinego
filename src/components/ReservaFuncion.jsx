import { useState } from "react";
import { Link } from "react-router-dom";
import SelectorAsientos from "./SelectorAsientos";
import { useAsientosQuery, useCrearReservaMutation } from "../services/reservasApi";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";

// Se monta de nuevo para cada función: nunca arrastra butacas de otro horario.
export default function ReservaFuncion({ funcion, titulo, onResumen }) {
  const { isAuthenticated } = useAuth();
  const { notificar } = useNotificaciones();
  const { data: asientos, error: errorAsientos, isFetching, refetch } = useAsientosQuery(funcion.id, { refetchOnMountOrArgChange: true });
  const [seleccionados, setSeleccionados] = useState([]);
  const [errorConfirmacion, setError] = useState("");
  const [crearReserva, { data: reserva, isLoading: enviando }] = useCrearReservaMutation();
  const error = errorConfirmacion || errorAsientos?.message;

  function cambiarAsiento(id) {
    const nuevos = seleccionados.includes(id)
      ? seleccionados.filter((actual) => actual !== id)
      : [...seleccionados, id];
    setSeleccionados(nuevos);
    onResumen(asientos.filter((a) => nuevos.includes(a.id)).map((a) => `${a.fila}${a.numero}`));
  }

  async function confirmar() {
    if (!isAuthenticated || enviando || isFetching || errorAsientos || reserva || !seleccionados.length) return;
    setError("");
    try {
      await crearReserva({ funcionId: funcion.id, asientoIds: seleccionados }).unwrap();
      const cantidad = seleccionados.length;
      notificar(`Reserva confirmada: ${cantidad} ${cantidad === 1 ? "entrada" : "entradas"} para ${titulo}`);
    } catch (err) {
      if (err.status === 409) {
        notificar("Alguien reservó uno de esos asientos. Elegí otros", "error");
        setSeleccionados([]);
        onResumen([]);
      } else {
        setError(err.message);
      }
    }
  }

  return (
    <section className="funciones-asientos" aria-label="Asientos de la función">
      {reserva ? <div role="status"><h2>Reserva creada</h2><p>Número: {reserva.idReserva} · Estado: {reserva.estado}</p><p>Total: ${Number(reserva.total).toLocaleString("es-AR")}</p><Link to="/mis-reservas">Ver mis reservas</Link></div> : <>
        {!asientos && !error && <p role="status">Cargando asientos...</p>}
        {error && <p role="alert">{error}</p>}
        {errorAsientos && <button type="button" className="boton-continuar" disabled={isFetching} onClick={refetch}>Reintentar cargar asientos</button>}
        {asientos?.length === 0 && <p>Esta sala todavía no tiene asientos cargados.</p>}
        {asientos?.length > 0 && <fieldset disabled={enviando || isFetching || Boolean(errorAsientos)}>
          <SelectorAsientos asientos={asientos} asientosSeleccionados={seleccionados} onCambiarAsiento={cambiarAsiento} />
        </fieldset>}
        {isAuthenticated ? <button type="button" className="boton-continuar" disabled={enviando || isFetching || Boolean(errorAsientos) || !seleccionados.length} onClick={confirmar}>{enviando ? "Reservando..." : "Confirmar reserva"}</button> : <p>Para reservar, <Link to="/login" state={{ volverA: `/pelicula/${funcion.peliculaId}?funcionId=${encodeURIComponent(funcion.id)}` }}>iniciá sesión</Link>.</p>}
      </>}
    </section>
  );
}
