import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RutaInvitado() {
  const { isAuthenticated } = useAuth();

  // Si ya inició sesión, no tiene sentido mostrarle el Login ni el Registro
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RutaInvitado;
