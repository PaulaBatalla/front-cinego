import { useState } from "react";
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

  const handleSubmit = (event) => {
    event.preventDefault();

    const erroresEncontrados = validar(email, password);
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Iniciar sesión</h1>

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

      <button className="auth-submit" type="submit">
        Ingresar
      </button>
    </form>
  );
}

export default Login;
