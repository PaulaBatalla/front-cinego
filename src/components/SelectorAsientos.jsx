function SelectorAsientos({ asientos, asientosSeleccionados, onCambiarAsiento }) {
  const filas = [...new Set(asientos.map((a) => a.fila))].sort();
  return (
    <section>
      <h2>Elegí tus asientos</h2>
      <div className="pantalla">PANTALLA</div>
      <div className="asientos">
        {filas.map((fila) => (
          <div className="asientos-fila" key={fila}>
            {asientos.filter((a) => a.fila === fila).sort((a, b) => a.numero - b.numero).map((a) => {
              const seleccionado = asientosSeleccionados.includes(a.id);
              return <button key={a.id} type="button" className={`asiento asiento--${a.ocupado ? "ocupado" : seleccionado ? "seleccionado" : "disponible"}`} disabled={a.ocupado} aria-pressed={seleccionado} aria-label={`${a.fila}${a.numero}${a.ocupado ? ", ocupado" : ""}`} onClick={() => onCambiarAsiento(a.id)}>{a.fila}{a.numero}</button>;
            })}
          </div>
        ))}
      </div>
      <div className="referencias-asientos"><span>Disponible</span><span>Seleccionado</span><span>Ocupado</span></div>
    </section>
  );
}
export default SelectorAsientos;
