import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>

      <label>
        Email
        <input
          type="email"
          name="email"
          placeholder="nombre@mail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <button type="submit">Ingresar</button>
    </form>
  );
}

export default Login;
