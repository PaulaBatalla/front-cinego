const moneda = (importe) => `$${importe.toLocaleString("es-AR")}`;

function ResumenReserva({ pelicula, funcion, asientos, total }) {
  return (
    <aside className="reserva-resumen" aria-labelledby="reserva-resumen-titulo">
      <h2 id="reserva-resumen-titulo">Tu reserva</h2>
      <dl>
        <div><dt>Día</dt><dd>{funcion ? new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric", month: "long" }).format(new Date(`${funcion.fecha}T12:00:00`)) : "Sin elegir"}</dd></div>
        <div><dt>Función</dt><dd>{funcion ? `Sala ${funcion.sala} · ${funcion.hora}` : "Sin elegir"}</dd></div>
        <div><dt>Asientos</dt><dd>{asientos.length ? asientos.join(", ") : "Sin elegir"}</dd></div>
      </dl>
      <p className="reserva-desglose"><span>{asientos.length} {asientos.length === 1 ? "entrada" : "entradas"} × {moneda(pelicula.precio)}</span><span>{moneda(total)}</span></p>
      <div className="reserva-total" aria-live="polite" aria-atomic="true"><span>Total</span><strong>{moneda(total)}</strong></div>
      <p className="reserva-nota">{asientos.length ? "Revisá los datos de tu función y las butacas seleccionadas." : "Elegí tus asientos para calcular el total."}</p>
    </aside>
  );
}

export default ResumenReserva;
