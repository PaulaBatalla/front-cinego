import { useState } from "react";
import { AuthContext } from "./AuthContext";

// El JWT tiene tres partes separadas por puntos; la del medio trae los datos
function leerUsuario(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const datos = JSON.parse(atob(base64));

    if (datos.exp * 1000 < Date.now()) {
      return null;
    }

    return { email: datos.sub, rol: datos.rol };
  } catch {
    return null;
  }
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const usuario = token ? leerUsuario(token) : null;

  const login = (nuevoToken) => {
    localStorage.setItem("token", nuevoToken);
    setToken(nuevoToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        isAuthenticated: Boolean(usuario),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
