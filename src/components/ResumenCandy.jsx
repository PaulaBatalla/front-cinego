import { useDispatch, useSelector } from "react-redux";
import { quitarCandy, vaciarCandy } from "../store/slices/candySlice";

function ResumenCandy() {
  const items = useSelector((state) => state.candy.items);
  const dispatch = useDispatch();

  const total = items.reduce(
    (acumulado, producto) => acumulado + producto.precio,
    0
  );

  return (
    <section>
      <h2>Tu selección de Candy</h2>

      {items.length === 0 ? (
        <p>No agregaste productos todavía.</p>
      ) : (
        <>
          <p>Productos seleccionados: {items.length}</p>

          <ul>
            {items.map((producto) => (
              <li key={producto.id}>
                {producto.nombre} — $
                {producto.precio.toLocaleString("es-AR")}{" "}
                <button
                  type="button"
                  onClick={() => dispatch(quitarCandy(producto.id))}
                >
                  Quitar
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