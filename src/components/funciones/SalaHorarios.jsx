// Una sala con sus horarios del día. Cada horario es un botón.
// Si hay promo, el precio original se muestra tachado al lado del precio con descuento.
function SalaHorarios({ sala, formato, precio, precioFinal = precio, funciones, funcionElegida, onElegir }) {
  const conDescuento = precioFinal < precio;

  return (
    <div className="sala">
      <div className="sala-info">
        <strong>
          {sala} · {formato}
        </strong>
        <span>
          {conDescuento && (
            <s className="precio-original">
              <span className="precio-original__lector">Antes </span>${precio.toLocaleString("es-AR")}
            </s>
          )}
          ${precioFinal.toLocaleString("es-AR")} por entrada
        </span>
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