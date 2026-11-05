import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { destinoTrasLogin } from "../utils/roles";

function RutaInvitado() {
  const { isAuthenticated, usuario } = useAuth();
  const location = useLocation();

  // Si ya inició sesión, no tiene sentido mostrarle el Login ni el Registro.
  // Usa el mismo destino que el Login para no pisar su redirección.
  if (isAuthenticated) {
    return <Navigate to={destinoTrasLogin(usuario, location.state?.volverA)} replace />;
  }

  return <Outlet />;
}

export default RutaInvitado;
