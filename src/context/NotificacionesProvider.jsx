import { useCallback, useState } from "react";
import { NotificacionesContext } from "./NotificacionesContext";

const DURACION_MS = 4000;

function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);

  const cerrar = useCallback((id) => {
    setNotificaciones((actuales) => actuales.filter((n) => n.id !== id));
  }, []);

  // duracion (opcional): para avisos que conviene dejar más tiempo, como los errores
  const notificar = useCallback(
    (mensaje, tipo = "exito", { duracion = DURACION_MS } = {}) => {
      const id = crypto.randomUUID();
      setNotificaciones((actuales) => [...actuales, { id, mensaje, tipo }]);
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
