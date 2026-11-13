import { useDispatch, useSelector } from "react-redux";
import { logout as cerrarSesion } from "../store/slices/authSlice";
import { esRolAdmin } from "../utils/roles";

import { solicitar } from "../services/api";
import { authService } from "../services/authService";

export function useAuth() {
  const dispatch = useDispatch();
  const { usuario, isAuthenticated } = useSelector((state) => state.auth);

  const logout = async () => {
    let pendientesCanceladas = true;
    try {
      if (isAuthenticated) {
        await solicitar("/reservas/pendientes/cancelar", { method: "PATCH" });
      }
    } catch {
      pendientesCanceladas = false;
    }
    await authService.logout();
    dispatch(cerrarSesion());
    return pendientesCanceladas;
  };

  return { usuario, isAuthenticated, esAdmin: esRolAdmin(usuario?.rol), logout };
}
