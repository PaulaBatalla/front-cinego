import { useMatch } from "react-router-dom";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { AlertIcon, CheckIcon } from "./icons";
import "../styles/Toasts.css";

function Toasts() {
  const { notificaciones, cerrar } = useNotificaciones();
  // En el panel los avisos van abajo, en crema y con icono, como en el mockup
  const enPanel = useMatch("/admin/*");

  return (
    <div className={`toasts${enPanel ? " toasts--admin" : ""}`} aria-live="polite">
      {notificaciones.map((notificacion) => (
        <div
          key={notificacion.id}
          className={`toast toast--${notificacion.tipo}`}
        >
          {enPanel &&
            (notificacion.tipo === "error" ? (
              <AlertIcon className="toast__icono" />
            ) : (
              <CheckIcon className="toast__icono" />
            ))}
          <p className="toast__mensaje">{notificacion.mensaje}</p>
          {notificacion.accion && (
            <button
              type="button"
              className="toast__accion"
              onClick={() => {
                notificacion.accion.onClick();
                cerrar(notificacion.id);
              }}
            >
              {notificacion.accion.texto}
            </button>
          )}
          {!enPanel && (
            <button
              type="button"
              className="toast__cerrar"
              onClick={() => cerrar(notificacion.id)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Toasts;
