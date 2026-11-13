import { useDispatch, useSelector } from "react-redux";
import {
  agregarItemCarrito,
  disminuirItemCarrito,
} from "../store/slices/candySlice";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";

function CandyCard({ item }) {
  const dispatch = useDispatch();
  const { notificar } = useNotificaciones();
  const { isAuthenticated } = useAuth();
  const imagenUrl = item.imagenUrl?.trim();

  const seleccionado = useSelector((state) =>
    state.candy.items.find(
      (producto) => (producto.candyId ?? producto.id) === item.id
    )
  );
  const cantidad = seleccionado ? seleccionado.cantidad : 0;

  const agregarAlPedido = () => {
    dispatch(
      agregarItemCarrito({
        producto: item,
        cantidad: 1,
        isAuthenticated,
      })
    );
    notificar(`Agregaste ${item.nombre} a tu pedido`);
  };

  const restarDelPedido = () => {
    if (!seleccionado) return;
    dispatch(
      disminuirItemCarrito({
        item: seleccionado,
        isAuthenticated,
      })
    );
  };

  return (
    <article className="candy-card">
      <div className="candy-card-cover">
        {imagenUrl ? (
          <img
            className="candy-card-cover-img"
            src={imagenUrl}
            alt=""
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="candy-card-info">
        <h3 className="candy-card-titulo">{item.nombre}</h3>
        <p className="candy-card-desc">{item.descripcion}</p>

        <div className="candy-card-pie">
          <div className="candy-precios">
            <span className="candy-precio-actual">
              ${Number(item.precio).toLocaleString("es-AR")}
            </span>
          </div>

          {cantidad > 0 ? (
            <div className="candy-stepper" aria-label={`Control de unidades de ${item.nombre}`}>
              <button
                type="button"
                className="candy-stepper-btn"
                aria-label={`Restar una unidad de ${item.nombre}`}
                onClick={restarDelPedido}
              >
                −
              </button>
              <span className="candy-stepper-cant">{cantidad}</span>
              <button
                type="button"
                className="candy-stepper-btn sumar"
                aria-label={`Sumar una unidad de ${item.nombre}`}
                onClick={agregarAlPedido}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="candy-btn-agregar"
              aria-label={`Agregar ${item.nombre} al pedido`}
              onClick={agregarAlPedido}
            >
              +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default CandyCard;
