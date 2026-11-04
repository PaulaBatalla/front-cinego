import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  agregarCandy,
  disminuirCandy,
  quitarCandy,
  vaciarCandy,
} from "../store/slices/candySlice";
import { useNotificaciones } from "../hooks/useNotificaciones";

function ResumenCandy() {
  const items = useSelector((state) => state.candy.items);
  const dispatch = useDispatch();
  const { notificar } = useNotificaciones();

  if (items.length === 0) {
    return null; // Si no hay productos, la vista se mantiene exactamente como en la página 11 del PDF
  }

  const unidades = items.reduce(
    (acumulado, producto) => acumulado + producto.cantidad,
    0
  );

  const vaciarPedido = () => {
    dispatch(vaciarCandy());
    notificar("Vaciaste tu pedido de Candy");
  };

  const quitarDelPedido = (producto) => {
    dispatch(quitarCandy(producto.id));
    notificar(`Quitaste ${producto.nombre}`);
  };

  const total = items.reduce(
    (acumulado, producto) =>
      acumulado + producto.precio * producto.cantidad,
    0
  );

  return (
    <section className="candy-resumen-panel" aria-label="Resumen de tu pedido de Candy">
      <div className="candy-resumen-header">
        <h2>
          Tu pedido de Candy
          <span className="candy-resumen-badge">{unidades} {unidades === 1 ? "unidad" : "unidades"}</span>
        </h2>
        <button
          type="button"
          className="candy-btn-vaciar"
          onClick={vaciarPedido}
        >
          Vaciar pedido
        </button>
      </div>

      <ul className="candy-resumen-lista">
        {items.map((producto) => (
          <li className="candy-resumen-item" key={producto.id}>
            <div className="candy-resumen-item-datos">
              <p className="candy-resumen-item-nombre">{producto.nombre}</p>
              <p className="candy-resumen-item-unitario">
                ${Number(producto.precio).toLocaleString("es-AR")} c/u
              </p>
            </div>

            <div className="candy-stepper">
              <button
                type="button"
                className="candy-stepper-btn"
                aria-label={`Restar una unidad de ${producto.nombre}`}
                onClick={() => dispatch(disminuirCandy(producto.id))}
              >
                −
              </button>
              <span className="candy-stepper-cant">{producto.cantidad}</span>
              <button
                type="button"
                className="candy-stepper-btn sumar"
                aria-label={`Sumar una unidad de ${producto.nombre}`}
                onClick={() => dispatch(agregarCandy(producto))}
              >
                +
              </button>
            </div>

            <span className="candy-resumen-subtotal">
              ${Number(producto.precio * producto.cantidad).toLocaleString("es-AR")}
            </span>

            <button
              type="button"
              className="candy-resumen-quitar"
              title="Quitar este producto"
              onClick={() => quitarDelPedido(producto)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="candy-resumen-pie">
        <div className="candy-resumen-total-bloque">
          <span className="candy-resumen-total-label">Total Candy</span>
          <span className="candy-resumen-total-monto">
            ${Number(total).toLocaleString("es-AR")}
          </span>
        </div>

        <div className="candy-resumen-acciones">
          <Link to="/" className="candy-btn-continuar">
            Ver funciones para tu entrada →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ResumenCandy;