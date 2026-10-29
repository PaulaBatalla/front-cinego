import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RutaAdmin() {
  const { isAuthenticated, esAdmin } = useAuth();
  const location = useLocation();

  // Sin sesión: al login, y después de ingresar vuelve al panel
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ volverA: location.pathname }} replace />;
  }

  // Con sesión pero sin rol de admin: el panel no es para este usuario
  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RutaAdmin;
