import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { authService } from "../services/authService";
import { validarLogin } from "../utils/validaciones";
import CampoFormulario from "./CampoFormulario";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [errorLogin, setErrorLogin] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const { notificar } = useNotificaciones();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorLogin(null);

    const erroresEncontrados = validarLogin(email, password);
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    setCargando(true);

    try {
      const token = await authService.login(email, password);
      login(token);
      notificar("Sesión iniciada");
      navigate(location.state?.volverA || "/", { replace: true });
    } catch (err) {
      setErrorLogin(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Iniciar sesión</h1>

      {errorLogin && (
        <p className="auth-alert" role="alert">
          {errorLogin}
        </p>
      )}

      <CampoFormulario
        etiqueta="Email"
        type="email"
        name="email"
        placeholder="nombre@mail.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errores.email}
      />

      <CampoFormulario
        etiqueta="Contraseña"
        type="password"
        name="password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errores.password}
      />

      <button className="auth-submit" type="submit" disabled={cargando}>
        {cargando ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="auth-switch">
        ¿No tenés cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>
    </form>
  );
}

export default Login;
