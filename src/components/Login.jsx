import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

function validar(email, password) {
  const errores = {};

  if (!email.trim()) {
    errores.email = "Ingresá tu email.";
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errores.email = "Ingresá un email válido.";
  }

  if (!password) {
    errores.password = "Ingresá tu contraseña.";
  }

  return errores;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [errorLogin, setErrorLogin] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const recienRegistrado = location.state?.registrado;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorLogin(null);

    const erroresEncontrados = validar(email, password);
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:8080/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (respuesta.status === 401 || respuesta.status === 403) {
        throw new Error("Email o contraseña incorrectos.");
      }

      if (!respuesta.ok) {
        throw new Error(`No se pudo iniciar sesión (${respuesta.status})`);
      }

      // El back devuelve el JWT como texto plano, no como JSON
      const token = await respuesta.text();
      login(token);
      navigate("/");
    } catch (err) {
      setErrorLogin(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err.message
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Iniciar sesión</h1>

      {recienRegistrado && !errorLogin && (
        <p className="auth-success">
          Cuenta creada. Ya podés iniciar sesión.
        </p>
      )}

      {errorLogin && (
        <p className="auth-alert" role="alert">
          {errorLogin}
        </p>
      )}

      <label className="auth-field">
        Email
        <input
          type="email"
          name="email"
          placeholder="nombre@mail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errores.email)}
        />
        {errores.email && <span className="auth-error">{errores.email}</span>}
      </label>

      <label className="auth-field">
        Contraseña
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(errores.password)}
        />
        {errores.password && (
          <span className="auth-error">{errores.password}</span>
        )}
      </label>

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
