// Una sala con sus horarios del día. Cada horario es un botón.
function SalaHorarios({ sala, formato, precio, funciones, funcionElegida, onElegir }) {
  return (
    <div className="sala">
      <div className="sala-info">
        <strong>
          {sala} · {formato}
        </strong>
        <span>${precio.toLocaleString("es-AR")} por entrada</span>
      </div>
      <div className="horarios">
        {funciones.map((funcion) => {
          const elegida = funcionElegida !== null && funcionElegida.id === funcion.id;
          return (
            <button
              key={funcion.id}
              type="button"
              className={elegida ? "horario horario-activo" : "horario"}
              aria-pressed={elegida}
              aria-label={`${sala}, ${funcion.hora}`}
              onClick={() => onElegir(funcion)}
            >
              {funcion.hora}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SalaHorarios;