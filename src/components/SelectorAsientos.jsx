function SelectorAsientos({
  asientos,
  asientosOcupados,
  asientosSeleccionados,
  onCambiarAsiento,
}) {
  const filas = ["A", "B"];

  return (
    <section>
      <h2>Elegí tus asientos</h2>

      <div className="pantalla">PANTALLA</div>

      <div className="asientos">
        {filas.map((fila) => (
          <div className="asientos-fila" key={fila}>
            {asientos
              .filter((asiento) => asiento.startsWith(fila))
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
        <span>Disponible</span>
        <span>Seleccionado</span>
        <span>Ocupado</span>
      </div>
    </section>
  );
}

export default SelectorAsientos;