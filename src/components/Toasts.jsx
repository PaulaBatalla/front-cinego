import { useNotificaciones } from "../hooks/useNotificaciones";
import "../styles/Toasts.css";

function Toasts() {
  const { notificaciones, cerrar } = useNotificaciones();

  return (
    <div className="toasts" aria-live="polite">
      {notificaciones.map((notificacion) => (
        <div
          key={notificacion.id}
          className={`toast toast--${notificacion.tipo}`}
        >
          <p className="toast__mensaje">{notificacion.mensaje}</p>
          <button
            type="button"
            className="toast__cerrar"
            onClick={() => cerrar(notificacion.id)}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toasts;
