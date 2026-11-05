import { useDispatch, useSelector } from "react-redux";
import { logout as cerrarSesion } from "../store/slices/authSlice";
import { esRolAdmin } from "../utils/roles";

export function useAuth() {
  const dispatch = useDispatch();
  const { token, usuario, isAuthenticated } = useSelector((state) => state.auth);

  const logout = () => {
    localStorage.removeItem("token");
    dispatch(cerrarSesion());
  };

  return { token, usuario, isAuthenticated, esAdmin: esRolAdmin(usuario?.rol), logout };
}
