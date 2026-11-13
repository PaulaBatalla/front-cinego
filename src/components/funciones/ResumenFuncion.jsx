
import { formatearPorcentaje } from "../../utils/promos";

// Cuadro con lo que eligió el usuario. El botón para seguir llega por children.
function ResumenFuncion({ titulo, funcion, children }) {
  const conDescuento = Boolean(funcion) && funcion.precioFinal < funcion.precio;

  return (
    <aside className="resumen">
      <h3>Tu función</h3>
      <dl>
        <div>
          <dt>Película</dt>
          <dd>{titulo}</dd>
        </div>
        <div>
          <dt>Día</dt>
          <dd>{funcion ? funcion.fecha : "Sin elegir"}</dd>
        </div>
        <div>
          <dt>Sala</dt>
          <dd>{funcion ? funcion.sala : "Sin elegir"}</dd>
        </div>
        <div>
          <dt>Horario</dt>
          <dd>{funcion ? funcion.hora : "Sin elegir"}</dd>
        </div>
        <div>
          <dt>Precio por entrada</dt>
          <dd>
            {funcion ? (
              <>
                {conDescuento && (
                  <s className="precio-original">
                    <span className="precio-original__lector">Antes </span>$
                    {funcion.precio.toLocaleString("es-AR")}
                  </s>
                )}
                ${funcion.precioFinal.toLocaleString("es-AR")}
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
        {conDescuento && funcion.descuentoNombre && (
          <div>
            <dt>Promo</dt>
            <dd className="resumen-promo">
              {funcion.descuentoNombre} ({formatearPorcentaje(funcion.descuentoPorcentaje)})
            </dd>
          </div>
        )}
      </dl>
      {children}
    </aside>
  );
}

export default ResumenFuncion;
