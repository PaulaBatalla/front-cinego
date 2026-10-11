import { useState } from "react";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>

      <label className="auth-field">
        Email
        <input
          type="email"
          name="email"
          placeholder="nombre@mail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="auth-field">
        Contraseña
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <button className="auth-submit" type="submit">Ingresar</button>
    </form>
  );
}

export default Login;
