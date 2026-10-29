import { useCallback, useState } from "react";
import { NotificacionesContext } from "./NotificacionesContext";

const DURACION_MS = 4000;

function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);

  const cerrar = useCallback((id) => {
    setNotificaciones((actuales) => actuales.filter((n) => n.id !== id));
  }, []);

  // accion (opcional): { texto, onClick }, por ejemplo el "Deshacer" del panel
  const notificar = useCallback(
    (mensaje, tipo = "exito", { accion, duracion = DURACION_MS } = {}) => {
      const id = crypto.randomUUID();
      setNotificaciones((actuales) => [...actuales, { id, mensaje, tipo, accion }]);
      setTimeout(() => cerrar(id), duracion);
    },
    [cerrar]
  );

  return (
    <NotificacionesContext.Provider value={{ notificaciones, notificar, cerrar }}>
      {children}
    </NotificacionesContext.Provider>
  );
}

export default NotificacionesProvider;
