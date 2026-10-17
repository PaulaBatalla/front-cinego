function SelectorAsientos({
  asientos,
  asientosOcupados,
  asientosSeleccionados,
  onCambiarAsiento,
}) {
  const filas = [...new Set(asientos.map((asiento) => asiento.replace(/\d+$/, "")))];

  return (
    <section className="reserva-sala">
      <h2>Asientos</h2>
      <p className="reserva-ayuda">Podés seleccionar más de una butaca.</p>

      <div className="pantalla">PANTALLA</div>

      <div className="asientos">
        {filas.map((fila) => (
          <div className="asientos-fila" key={fila}>
            <span className="asientos-letra" aria-hidden="true">{fila}</span>
            {asientos
              .filter((asiento) => asiento.replace(/\d+$/, "") === fila)
              .map((asiento) => {
                const estaOcupado = asientosOcupados.includes(asiento);
                const estaSeleccionado =
                  asientosSeleccionados.includes(asiento);

                let clase = "asiento asiento--disponible";

                if (estaOcupado) {
                  clase = "asiento asiento--ocupado";
                } else if (estaSeleccionado) {
                  clase = "asiento asiento--seleccionado";
                }

                return (
                  <button
                    key={asiento}
                    type="button"
                    className={clase}
                    disabled={estaOcupado}
                    aria-pressed={estaSeleccionado}
                    aria-label={`Asiento ${asiento}, ${estaOcupado ? "ocupado" : estaSeleccionado ? "seleccionado" : "disponible"}`}
                    onClick={() => onCambiarAsiento(asiento)}
                  >
                    {asiento}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      <div className="referencias-asientos">
        <span><i className="referencia referencia--disponible" />Disponible</span>
        <span><i className="referencia referencia--seleccionado" />Seleccionado</span>
        <span><i className="referencia referencia--ocupado" />Ocupado</span>
      </div>
    </section>
  );
}

export default SelectorAsientos;
