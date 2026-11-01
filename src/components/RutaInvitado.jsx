import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RutaInvitado() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si ya inició sesión, no tiene sentido mostrarle el Login ni el Registro
  if (isAuthenticated) {
    return <Navigate to={location.state?.volverA || "/"} replace />;
  }

  return <Outlet />;
}

export default RutaInvitado;
