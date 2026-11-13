import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  agregarCandy,
  disminuirCandy,
  agregarItemCarrito,
  disminuirItemCarrito,
} from "../store/slices/candySlice";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";

function obtenerFotoPorNombre(nombre = "") {
  const texto = nombre.toLowerCase();
  if (
    texto.includes("combo") ||
    texto.includes("pareja") ||
    texto.includes("familiar") ||
    texto.includes("solo")
  ) {
    return "/candy/combo-clasico.jpg";
  }
  if (texto.includes("caramelo") || texto.includes("dulce")) {
    return "/candy/pochoclos-caramelo.jpg";
  }
  if (texto.includes("pochoclo") || texto.includes("pop")) {
    return "/candy/pochoclos-clasicos.jpg";
  }
  if (texto.includes("nacho") || texto.includes("queso")) {
    return "/candy/nachos-queso.jpg";
  }
  if (
    texto.includes("gaseosa") ||
    texto.includes("bebida") ||
    texto.includes("agua") ||
    texto.includes("cola")
  ) {
    return "/candy/gaseosa-grande.jpg";
  }
  return "/candy/combo-clasico.jpg";
}

function CandyCard({ item, soloLocal = false }) {
  const dispatch = useDispatch();
  const { notificar } = useNotificaciones();
  const { isAuthenticated, token } = useAuth();
  const sincronizarConBack = !soloLocal && Boolean(isAuthenticated && token);
  const [urlsFallidas, setUrlsFallidas] = useState([]);
  const foto = obtenerFotoPorNombre(item.nombre);
  const candidatos = [item.imagenUrl?.trim(), foto, "/candy/combo-clasico.jpg"].filter(Boolean);
  const imagenSrc = candidatos.find((u) => !urlsFallidas.includes(u)) || foto;

  const seleccionado = useSelector((state) =>
    state.candy.items.find(
      (producto) => (producto.candyId ?? producto.id) === item.id
    )
  );
  const cantidad = seleccionado ? seleccionado.cantidad : 0;

  const agregarAlPedido = () => {
    if (!sincronizarConBack) {
      dispatch(agregarCandy(item));
    } else {
      dispatch(
        agregarItemCarrito({
          producto: item,
          cantidad: 1,
          isAuthenticated: true,
        })
      );
    }
    notificar(`Agregaste ${item.nombre} a tu pedido`);
  };

  const restarDelPedido = () => {
    if (!seleccionado) return;
    if (!sincronizarConBack) {
      dispatch(disminuirCandy(item.id));
    } else {
      dispatch(
        disminuirItemCarrito({
          item: seleccionado,
          isAuthenticated: true,
        })
      );
    }
  };

  return (
    <article className="candy-card">
      <div className="candy-card-cover">
        <img
          className="candy-card-cover-img"
          src={imagenSrc}
          alt={item.nombre}
          loading="lazy"
          onError={() => {
            if (!urlsFallidas.includes(imagenSrc)) {
              setUrlsFallidas((prev) => [...prev, imagenSrc]);
            }
          }}
        />
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
