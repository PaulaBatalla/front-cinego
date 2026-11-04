import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { clearError, loginUser } from "../store/slices/authSlice";
import { validarLogin } from "../utils/validaciones";
import CampoFormulario from "./CampoFormulario";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});
  const { isLoading, error } = useSelector((state) => state.auth);
  const { notificar } = useNotificaciones();
  const dispatch = useDispatch();

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearError());

    const erroresEncontrados = validarLogin(email, password);
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    const resultado = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultado)) {
      notificar("Sesión iniciada");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Iniciar sesión</h1>

      {error && (
        <p className="auth-alert" role="alert">
          {error}
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

      <button className="auth-submit" type="submit" disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Ingresar"}
      </button>

      <p className="auth-switch">
        ¿No tenés cuenta? <Link to="/registro">Crear cuenta</Link>
      </p>
    </form>
  );
}

export default Login;
