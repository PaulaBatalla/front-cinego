import { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

function Registro() {
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    repetirPassword: "",
    fechaNacimiento: "",
    sexo: "",
  });

  const handleChange = (event) => {
    setDatos({
      ...datos,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Crear cuenta</h1>

      <label className="auth-field">
        Nombre
        <input
          type="text"
          name="nombre"
          placeholder="Tu nombre"
          value={datos.nombre}
          onChange={handleChange}
        />
      </label>

      <label className="auth-field">
        Apellido
        <input
          type="text"
          name="apellido"
          placeholder="Tu apellido"
          value={datos.apellido}
          onChange={handleChange}
        />
      </label>

      <label className="auth-field">
        Email
        <input
          type="email"
          name="email"
          placeholder="nombre@mail.com"
          value={datos.email}
          onChange={handleChange}
        />
      </label>

      <label className="auth-field">
        Contraseña
        <input
          type="password"
          name="password"
          placeholder="Mínimo 8 caracteres"
          value={datos.password}
          onChange={handleChange}
        />
      </label>

      <label className="auth-field">
        Repetir contraseña
        <input
          type="password"
          name="repetirPassword"
          placeholder="••••••••"
          value={datos.repetirPassword}
          onChange={handleChange}
        />
      </label>

      <label className="auth-field">
        Fecha de nacimiento
        <input
          type="date"
          name="fechaNacimiento"
          value={datos.fechaNacimiento}
          onChange={handleChange}
        />
      </label>

      <label className="auth-field">
        Sexo
        <select name="sexo" value={datos.sexo} onChange={handleChange}>
          <option value="">Elegí una opción</option>
          <option value="F">Femenino</option>
          <option value="M">Masculino</option>
          <option value="X">Otro</option>
          <option value="N">Prefiero no decirlo</option>
        </select>
      </label>

      <button className="auth-submit" type="submit">
        Crear cuenta
      </button>

      <p className="auth-switch">
        ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </form>
  );
}

export default Registro;
