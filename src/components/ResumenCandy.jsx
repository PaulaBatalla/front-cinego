import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  agregarItemCarrito,
  disminuirItemCarrito,
  quitarItemCarrito,
  vaciarCandyLocal,
  vaciarPedidoCarrito,
} from "../store/slices/candySlice";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";

function generarMatrizQr(codigo) {
  const tam = 11;
  const celdas = [];
  const esPatronFijo = (f, c) =>
    (f < 4 && c < 4) || (f < 4 && c >= tam - 4) || (f >= tam - 4 && c < 4);

  for (let f = 0; f < tam; f += 1) {
    for (let c = 0; c < tam; c += 1) {
      let activo = false;
      if (f < 3 && c < 3) {
        activo = f === 0 || f === 2 || c === 0 || c === 2 || (f === 1 && c === 1);
      } else if (f < 3 && c >= tam - 3) {
        const lc = c - (tam - 3);
        activo = f === 0 || f === 2 || lc === 0 || lc === 2 || (f === 1 && lc === 1);
      } else if (f >= tam - 3 && c < 3) {
        const lf = f - (tam - 3);
        activo = lf === 0 || lf === 2 || c === 0 || c === 2 || (lf === 1 && c === 1);
      } else if (!esPatronFijo(f, c)) {
        const charCode = codigo.charCodeAt((f * tam + c) % codigo.length) || 65;
        activo = ((charCode + f * 7 + c * 13) % 3) !== 0;
      }
      if (activo) celdas.push({ f, c });
    }
  }
  return { tam, celdas };
}

function ResumenCandy() {
  const items = useSelector((state) => state.candy.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notificar } = useNotificaciones();
  const { isAuthenticated } = useAuth();
  const tieneSesionRemota = isAuthenticated;
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  useEffect(() => {
    if (!pedidoConfirmado) return;
    const alPresionarTecla = (event) => {
      if (event.key === "Escape") setPedidoConfirmado(null);
    };
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [pedidoConfirmado]);

  if (items.length === 0 && !pedidoConfirmado) {
    return null;
  }

  const unidades = items.reduce(
    (acumulado, producto) => acumulado + producto.cantidad,
    0
  );

  const vaciarPedido = () => {
    dispatch(vaciarPedidoCarrito({ items, isAuthenticated: tieneSesionRemota }));
    notificar("Vaciaste tu pedido de Candy");
  };

  const quitarDelPedido = (producto) => {
    dispatch(quitarItemCarrito({ item: producto, isAuthenticated: tieneSesionRemota }));
    notificar(`Quitaste ${producto.nombre}`);
  };

  const total = items.reduce(
    (acumulado, producto) =>
      acumulado + Number(producto.precio) * producto.cantidad,
    0
  );

  const confirmarPedidoDirecto = async () => {
    if (!isAuthenticated) {
      notificar("Iniciá sesión para confirmar tu pedido de Candy");
      navigate("/login", { state: { volverA: "/candy" } });
      return;
    }

    const sufijo = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `CNG-${sufijo}-${String(Date.now()).slice(-4)}`;
    const resumen = {
      codigo,
      items: [...items],
      unidades,
      total,
      fecha: new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPedidoConfirmado(resumen);
    await dispatch(
      vaciarPedidoCarrito({ items, isAuthenticated: tieneSesionRemota })
    );
    dispatch(vaciarCandyLocal());
    notificar("¡Pedido de Candy confirmado! Retiralo en el Mostrador Express.");
  };

  const qr = pedidoConfirmado ? generarMatrizQr(pedidoConfirmado.codigo) : null;

  return (
    <>
      {items.length > 0 && (
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
                    onClick={() =>
                      dispatch(
                        disminuirItemCarrito({
                          item: producto,
                          isAuthenticated: tieneSesionRemota,
                        })
                      )
                    }
                  >
                    −
                  </button>
                  <span className="candy-stepper-cant">{producto.cantidad}</span>
                  <button
                    type="button"
                    className="candy-stepper-btn sumar"
                    aria-label={`Sumar una unidad de ${producto.nombre}`}
                    onClick={() =>
                      dispatch(
                        agregarItemCarrito({
                          producto: { id: producto.candyId ?? producto.id },
                          cantidad: 1,
                          isAuthenticated: tieneSesionRemota,
                        })
                      )
                    }
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
              <Link to="/" className="candy-btn-secundario">
                Ver funciones para tu entrada →
              </Link>
              <button
                type="button"
                className="candy-btn-continuar"
                onClick={confirmarPedidoDirecto}
              >
                Confirmar pedido de Candy
              </button>
            </div>
          </div>
        </section>
      )}

      {pedidoConfirmado && (
        <div
          className="candy-modal-backdrop"
          role="presentation"
          onClick={() => setPedidoConfirmado(null)}
        >
          <div
            className="candy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candy-modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="candy-modal-tag">Mostrador Express</span>
            <h3 id="candy-modal-titulo">¡Pedido confirmado!</h3>
            <p className="candy-modal-sub">
              Presentá este código o QR en el Mostrador Express sin hacer fila ({pedidoConfirmado.fecha} hs).
            </p>

            <div className="candy-qr-box">
              <svg
                className="candy-qr-svg"
                viewBox={`0 0 ${qr.tam} ${qr.tam}`}
                role="img"
                aria-label={`Código QR de retiro ${pedidoConfirmado.codigo}`}
              >
                <rect width={qr.tam} height={qr.tam} fill="#ffffff" />
                {qr.celdas.map(({ f, c }) => (
                  <rect
                    key={`${f}-${c}`}
                    x={c}
                    y={f}
                    width={1}
                    height={1}
                    fill="#0e0e10"
                  />
                ))}
              </svg>
              <div className="candy-codigo-retiro">
                <span>Código de retiro</span>
                <strong>{pedidoConfirmado.codigo}</strong>
              </div>
            </div>

            <ul className="candy-modal-detalle" aria-label="Detalle del pedido confirmado">
              {pedidoConfirmado.items.map((item) => (
                <li key={item.id ?? item.candyId}>
                  <span>{item.cantidad} × {item.nombre}</span>
                  <span>
                    ${Number(Number(item.precio) * item.cantidad).toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
              <li className="candy-modal-total">
                <strong>Total pagado</strong>
                <strong>${Number(pedidoConfirmado.total).toLocaleString("es-AR")}</strong>
              </li>
            </ul>

            <button
              type="button"
              className="candy-btn-continuar candy-modal-cerrar"
              onClick={() => setPedidoConfirmado(null)}
            >
              Listo, entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ResumenCandy;
