import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { avisarSesionVencida } from "../services/sesionService";
import { leerToken, tokenVigente } from "../utils/sesion";

export default function ControlSesion({ children }) {
  const { token, sesionVencida } = useSelector((state) => state.auth);
  const location = useLocation();
  useEffect(() => {
    if (!token) return;
    let temporizador;
    const comprobar = () => {
      clearTimeout(temporizador);
      if (!tokenVigente(token)) {
        avisarSesionVencida(token);
        return;
      }
      const restante = leerToken(token).exp * 1000 - Date.now();
      temporizador = setTimeout(comprobar, Math.min(restante, 2147483647));
    };
    comprobar();
    window.addEventListener("focus", comprobar);
    document.addEventListener("visibilitychange", comprobar);
    return () => {
      clearTimeout(temporizador);
      window.removeEventListener("focus", comprobar);
      document.removeEventListener("visibilitychange", comprobar);
    };
  }, [token]);

  if (sesionVencida && location.pathname !== "/login") {
    const volverA = location.pathname === "/registro" ? "/" : location.pathname + location.search + location.hash;
    return <Navigate to="/login" replace state={{ volverA, sesionVencida: true }} />;
  }
  return children;
}
