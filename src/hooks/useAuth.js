import { useDispatch, useSelector } from "react-redux";
import { logout as cerrarSesion } from "../store/slices/authSlice";
import { esRolAdmin } from "../utils/roles";

import { solicitar } from "../services/api";
import { tokenVigente } from "../utils/sesion";

export function useAuth() {
  const dispatch = useDispatch();
  const { token, usuario, isAuthenticated } = useSelector((state) => state.auth);

  const logout = async () => {
    let pendientesCanceladas = true;
    try {
      if (token && tokenVigente(token)) {
        await solicitar("/reservas/pendientes/cancelar", { method: "PATCH" });
      }
    } catch {
      pendientesCanceladas = false;
    } finally {
      localStorage.removeItem("token");
      dispatch(cerrarSesion());
    }
    return pendientesCanceladas;
  };

  return { token, usuario, isAuthenticated, esAdmin: esRolAdmin(usuario?.rol), logout };
}
