import { useDispatch, useSelector } from "react-redux";
import {
  agregarCandy,
  disminuirCandy,
  quitarCandy,
  vaciarCandy,
} from "../../store/slices/candySlice";

function ResumenCandy() {
  const items = useSelector((state) => state.candy.items);
  const dispatch = useDispatch();

  const unidades = items.reduce(
    (acumulado, producto) => acumulado + producto.cantidad,
    0
  );

  const total = items.reduce(
    (acumulado, producto) =>
      acumulado + producto.precio * producto.cantidad,
    0
  );

  return (
    <section>
      <h2>Tu selección de Candy</h2>

      {items.length === 0 ? (
        <p>No agregaste productos todavía.</p>
      ) : (
        <>
          <p>Unidades seleccionadas: {unidades}</p>

          <ul>
            {items.map((producto) => (
              <li key={producto.id}>
                <p>
                  {producto.nombre} — $
                  {producto.precio.toLocaleString("es-AR")} por unidad
                </p>

                <button
                  type="button"
                  aria-label={`Restar una unidad de ${producto.nombre}`}
                  onClick={() => dispatch(disminuirCandy(producto.id))}
                >
                  −
                </button>

                <span> {producto.cantidad} </span>

                <button
                  type="button"
                  aria-label={`Sumar una unidad de ${producto.nombre}`}
                  onClick={() => dispatch(agregarCandy(producto))}
                >
                  +
                </button>

                <p>
                  Subtotal: $
                  {(producto.precio * producto.cantidad).toLocaleString(
                    "es-AR"
                  )}
                </p>

                <button
                  type="button"
                  onClick={() => dispatch(quitarCandy(producto.id))}
                >
                  Quitar producto
                </button>
              </li>
            ))}
          </ul>

          <p>Total: ${total.toLocaleString("es-AR")}</p>

          <button
            type="button"
            onClick={() => dispatch(vaciarCandy())}
          >
            Vaciar selección
          </button>
        </>
      )}
    </section>
  );
}

export default ResumenCandy;