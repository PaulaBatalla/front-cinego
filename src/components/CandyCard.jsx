import { useDispatch, useSelector } from "react-redux";
import {
  agregarItemCarrito,
  disminuirItemCarrito,
} from "../store/slices/candySlice";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";
import CandyIcon from "./CandyIcon";

function CandyCard({ item }) {
  const dispatch = useDispatch();
  const { notificar } = useNotificaciones();
  const { isAuthenticated } = useAuth();

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
      {/* Contenedor pastel con ilustración y badge */}
      <div
        className="candy-card-cover"
        style={{ backgroundColor: item.color || "#f6d895" }}
      >
        {item.badge && (
          <span className="candy-card-badge">{item.badge}</span>
        )}

        <div className="candy-card-icono-wrap">
          <CandyIcon tipo={item.icono} />
        </div>

        <span className="candy-card-label-imagen">IMAGEN</span>
      </div>

      {/* Datos del producto */}
      <div className="candy-card-info">
        {item.categoria && (
          <span className="candy-card-categoria">{item.categoria}</span>
        )}
        <h3 className="candy-card-titulo">{item.nombre}</h3>
        <p className="candy-card-desc">{item.descripcion}</p>

        {/* Pie con precio y botón de agregar */}
        <div className="candy-card-pie">
          <div className="candy-precios">
            <span className="candy-precio-actual">
              ${Number(item.precio).toLocaleString("es-AR")}
            </span>
            {item.precioMostrador && (
              <span
                className="candy-precio-tachado"
                title="Precio en mostrador"
              >
                ${Number(item.precioMostrador).toLocaleString("es-AR")}
              </span>
            )}
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
