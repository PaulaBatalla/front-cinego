import { useCallback, useState } from "react";
import { NotificacionesContext } from "./NotificacionesContext";

const DURACION_MS = 4000;

function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);

  const cerrar = useCallback((id) => {
    setNotificaciones((actuales) => actuales.filter((n) => n.id !== id));
  }, []);

  const notificar = useCallback(
    (mensaje, tipo = "exito") => {
      const id = crypto.randomUUID();
      setNotificaciones((actuales) => [...actuales, { id, mensaje, tipo }]);
      setTimeout(() => cerrar(id), DURACION_MS);
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
