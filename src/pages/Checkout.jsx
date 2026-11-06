import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useConfirmarReservaMutation, useFuncionesQuery, usePeliculasQuery, useReservaQuery } from "../services/reservasApi";
import "../styles/reserva.css";
import "../styles/misReservas.css";
import "../styles/checkout.css";

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export default function Checkout() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [tarjeta, setTarjeta] = useState(false);
  const [ahora, setAhora] = useState(Date.now);
  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(reloj);
  }, []);
  const reserva = useReservaQuery(id, { skip: !isAuthenticated, refetchOnMountOrArgChange: true, pollingInterval: 5000 });
  const funciones = useFuncionesQuery(undefined, { skip: !isAuthenticated });
  const peliculas = usePeliculasQuery(undefined, { skip: !isAuthenticated });
  const [confirmar, { data: confirmada, isLoading: enviando, error: errorPago }] = useConfirmarReservaMutation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ volverA: `/checkout/${id}` }} />;
  if (reserva.isLoading || funciones.isLoading || peliculas.isLoading) return <p role="status">Cargando reserva...</p>;
  if (reserva.error || funciones.error || peliculas.error || !reserva.data) return (
    <main className="reserva-page checkout">
      <h1>No pudimos cargar la reserva</h1>
      <p>Revisá tus reservas e intentá nuevamente.</p>
      <Link className="mis-reservas-accion" to="/mis-reservas">Ver mis reservas</Link>
    </main>
  );

  const actual = confirmada || reserva.data;
  const limite = Date.parse(actual.fechaReserva) + 10 * 60 * 1000;
  const vencida = actual.estado === "PENDIENTE" && ahora >= limite;
  const funcion = funciones.data?.find((item) => item.id === actual.idFuncion);
  const pelicula = peliculas.data?.find((item) => item.id === funcion?.peliculaId);
  const fecha = funcion?.horarioInicio
    ? new Date(funcion.horarioInicio).toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" })
    : "No disponible";
  const asientos = actual.asientos?.map((asiento) => `${asiento.fila}${asiento.numero}`).join(", ") || "No disponibles";

  async function confirmarPago(event) {
    event.preventDefault();
    if (!tarjeta || enviando || vencida || actual.estado !== "PENDIENTE" || Date.now() >= limite) return;
    try {
      await confirmar({ idReserva: id }).unwrap();
    } catch {
      // El error se muestra en la pantalla para que el usuario pueda reintentar.
    }
  }

  return (
    <main className="reserva-page checkout">
      <Link className="reserva-volver" to="/mis-reservas">← Volver a mis reservas</Link>
      <h1>{actual.estado === "CONFIRMADA" ? "Reserva confirmada" : "Finalizar reserva"}</h1>
      <div className="reserva-panel checkout-panel">
        <p className="checkout-numero">Reserva #{actual.idReserva}</p>
        <h2>{pelicula?.titulo || "Tu película"}</h2>
        <dl className="checkout-datos">
          <div><dt>Función</dt><dd>{fecha}</dd></div>
          <div><dt>Sala</dt><dd>{funcion?.salaNombre || "No disponible"}</dd></div>
          <div><dt>Asientos</dt><dd>{asientos}</dd></div>
        </dl>
        <div className="checkout-total"><span>Total</span><strong>{moneda.format(Number(actual.total ?? 0))}</strong></div>

        {actual.estado === "PENDIENTE" && !vencida ? (
          <form onSubmit={confirmarPago}>
            <p role="status">Tenés {Math.max(0, Math.ceil((limite - ahora) / 1000))} segundos para confirmar. Si cerrás sesión, se cancela.</p>
            <fieldset className="checkout-metodo">
              <legend>Medio de pago</legend>
              <label className="checkout-tarjeta"><input type="radio" name="metodo" checked={tarjeta} onChange={() => setTarjeta(true)} /> Tarjeta</label>
            </fieldset>
            {errorPago && <p role="alert">{errorPago.message || "No pudimos confirmar la reserva. Intentá nuevamente."}</p>}
            <button className="reserva-confirmar" type="submit" disabled={!tarjeta || enviando}>{enviando ? "Confirmando..." : "Confirmar pago"}</button>
          </form>
        ) : (
          <p role="status">{actual.estado === "CONFIRMADA" ? "Tu reserva está confirmada." : vencida ? "La reserva venció. Las butacas quedaron disponibles." : "Esta reserva está cancelada."}</p>
        )}
        {(actual.estado !== "PENDIENTE" || vencida) && <Link className="checkout-enlace" to="/mis-reservas">Ver mis reservas</Link>}
      </div>
    </main>
  );
}
