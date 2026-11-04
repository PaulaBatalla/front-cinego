import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SelectorAsientos from "./SelectorAsientos";
import { reservaService } from "../services/reservaService";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";

// Se monta de nuevo para cada función: nunca arrastra butacas de otro horario.
export default function ReservaFuncion({ funcion, titulo, onResumen }) {
  const { isAuthenticated } = useAuth();
  const { notificar } = useNotificaciones();
  const [asientos, setAsientos] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [reserva, setReserva] = useState(null);

  useEffect(() => {
    let activo = true;
    reservaService.asientos(funcion.id)
      .then((datos) => { if (activo) setAsientos(datos); })
      .catch((err) => { if (activo) setError(err.message); });
    return () => { activo = false; };
  }, [funcion.id, intento]);

  function cambiarAsiento(id) {
    const nuevos = seleccionados.includes(id)
      ? seleccionados.filter((actual) => actual !== id)
      : [...seleccionados, id];
    setSeleccionados(nuevos);
    onResumen(asientos.filter((a) => nuevos.includes(a.id)).map((a) => `${a.fila}${a.numero}`));
  }

  async function confirmar() {
    if (enviando || reserva || !seleccionados.length) return;
    setEnviando(true);
    setError("");
    try {
      setReserva(await reservaService.crear(funcion.id, seleccionados));
      const cantidad = seleccionados.length;
      notificar(`Reserva confirmada: ${cantidad} ${cantidad === 1 ? "entrada" : "entradas"} para ${titulo}`);
    } catch (err) {
      if (err.status === 409) {
        notificar("Alguien reservó uno de esos asientos. Elegí otros", "error");
        setSeleccionados([]);
        onResumen([]);
        setAsientos(null);
        setIntento((actual) => actual + 1);
      } else {
        setError(err.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="funciones-asientos" aria-label="Asientos de la función">
      {reserva ? <div role="status"><h2>Reserva creada</h2><p>Número: {reserva.idReserva} · Estado: {reserva.estado}</p><p>Total: ${Number(reserva.total).toLocaleString("es-AR")}</p></div> : <>
        {!asientos && !error && <p role="status">Cargando asientos...</p>}
        {error && <p role="alert">{error}</p>}
        {!asientos && error && <button type="button" className="boton-continuar" onClick={() => { setError(""); setIntento((actual) => actual + 1); }}>Reintentar cargar asientos</button>}
        {asientos?.length === 0 && <p>Esta sala todavía no tiene asientos cargados.</p>}
        {asientos?.length > 0 && <fieldset disabled={enviando}>
          <SelectorAsientos asientos={asientos} asientosSeleccionados={seleccionados} onCambiarAsiento={cambiarAsiento} />
        </fieldset>}
        {isAuthenticated ? <button type="button" className="boton-continuar" disabled={enviando || !seleccionados.length} onClick={confirmar}>{enviando ? "Reservando..." : "Confirmar reserva"}</button> : <p>Para reservar, <Link to="/login" state={{ volverA: `/pelicula/${funcion.peliculaId}` }}>iniciá sesión</Link>.</p>}
      </>}
    </section>
  );
}
