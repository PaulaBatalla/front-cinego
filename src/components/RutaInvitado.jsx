import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RutaInvitado() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si ya inició sesión, no tiene sentido mostrarle el Login ni el Registro
  if (isAuthenticated) {
    const destino = location.state?.volverA;
    const ruta = typeof destino === "string" && destino.startsWith("/") && !destino.startsWith("//")
      ? destino
      : "/";
    return <Navigate to={ruta} replace />;
  }

  return <Outlet />;
}

export default RutaInvitado;
