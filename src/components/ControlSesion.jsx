import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { verificarSesion } from "../store/slices/authSlice";

export default function ControlSesion({ children }) {
  const { verificandoSesion, errorVerificacion, sesionVencida } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Elimina el token que pudiera quedar de versiones anteriores de la app.
    localStorage.removeItem("token");
    dispatch(verificarSesion());
  }, [dispatch]);

  if (verificandoSesion) return <p role="status">Comprobando sesión...</p>;
  if (errorVerificacion) return <main><p role="alert">{errorVerificacion}</p><button type="button" onClick={() => dispatch(verificarSesion())}>Reintentar</button></main>;
  if (sesionVencida && location.pathname !== "/login") {
    const volverA = location.pathname === "/registro" ? "/" : location.pathname + location.search + location.hash;
    return <Navigate to="/login" replace state={{ volverA, sesionVencida: true }} />;
  }
  return children;
}
