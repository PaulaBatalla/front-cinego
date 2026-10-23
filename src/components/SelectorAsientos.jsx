import "./SelectorAsientos.css";

function SelectorAsientos({ asientos, asientosSeleccionados, onCambiarAsiento }) {
  const filas = [...new Set(asientos.map((a) => a.fila))].sort();

  return (
    <section className="selector-butacas-container" aria-label="Selección de butacas">
      <h2>Elegí tus butacas</h2>

      {/* Pantalla 3D */}
      <div className="pantalla-wrapper">
        <div className="pantalla">
          <span>PANTALLA</span>
        </div>
      </div>

      {/* Grilla de butacas por fila */}
      <div className="grilla">
        {filas.map((fila) => (
          <div className="fila" key={fila}>
            <span className="fila-label">{fila}</span>
            <div className="fila-butacas">
              {asientos
                .filter((a) => a.fila === fila)
                .sort((a, b) => a.numero - b.numero)
                .map((a) => {
                  const seleccionado = asientosSeleccionados.includes(a.id);
                  const estado = a.ocupado ? "ocupada" : seleccionado ? "seleccionada" : "libre";

                  return (
                    <button
                      key={a.id}
                      type="button"
                      className={`butaca ${estado}`}
                      disabled={a.ocupado}
                      aria-pressed={seleccionado}
                      aria-label={`Butaca ${a.fila}${a.numero}${a.ocupado ? ", ocupada" : ""}`}
                      onClick={() => onCambiarAsiento(a.id)}
                      title={`Butaca ${a.fila}${a.numero}`}
                    >
                      {a.numero}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda de estados */}
      <div className="leyenda">
        <span className="leyenda-item">
          <span className="dot libre"></span>Libre
        </span>
        <span className="leyenda-item">
          <span className="dot seleccionada"></span>Seleccionada
        </span>
        <span className="leyenda-item">
          <span className="dot ocupada"></span>Ocupada
        </span>
      </div>
    </section>
  );
}

export default SelectorAsientos;
