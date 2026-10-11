import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function validar(datos) {
  const errores = {};

  if (!datos.nombre.trim()) {
    errores.nombre = "Ingresá tu nombre.";
  }

  if (!datos.apellido.trim()) {
    errores.apellido = "Ingresá tu apellido.";
  }

  if (!datos.email.trim()) {
    errores.email = "Ingresá tu email.";
  } else if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) {
    errores.email = "Ingresá un email válido.";
  }

  if (!datos.password) {
    errores.password = "Ingresá una contraseña.";
  } else if (datos.password.length < 8) {
    errores.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (!datos.repetirPassword) {
    errores.repetirPassword = "Repetí la contraseña.";
  } else if (datos.repetirPassword !== datos.password) {
    errores.repetirPassword = "Las contraseñas no coinciden.";
  }

  // "en-CA" da la fecha local como YYYY-MM-DD, igual que el input date
  const hoy = new Date().toLocaleDateString("en-CA");

  if (!datos.fechaNacimiento) {
    errores.fechaNacimiento = "Ingresá tu fecha de nacimiento.";
  } else if (datos.fechaNacimiento > hoy) {
    errores.fechaNacimiento = "La fecha no puede ser futura.";
  }

  if (!datos.sexo) {
    errores.sexo = "Elegí una opción.";
  }

  return errores;
}

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

  const [errores, setErrores] = useState({});
  const [errorRegistro, setErrorRegistro] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorRegistro(null);

    const erroresEncontrados = validar(datos);
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://localhost:8080/api/usuarios/registro",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: datos.email.trim(),
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            password: datos.password,
            fechaNacimiento: datos.fechaNacimiento,
            sexo: datos.sexo,
          }),
        }
      );

      if (respuesta.status === 400) {
        // El back manda el motivo como texto (ej: email ya registrado)
        throw new Error(await respuesta.text());
      }

      if (!respuesta.ok) {
        throw new Error(`No se pudo crear la cuenta (${respuesta.status})`);
      }

      navigate("/login");
    } catch (err) {
      setErrorRegistro(
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
      <h1>Crear cuenta</h1>

      {errorRegistro && (
        <p className="auth-alert" role="alert">
          {errorRegistro}
        </p>
      )}

      <label className="auth-field">
        Nombre
        <input
          type="text"
          name="nombre"
          placeholder="Tu nombre"
          value={datos.nombre}
          onChange={handleChange}
          aria-invalid={Boolean(errores.nombre)}
        />
        {errores.nombre && <span className="auth-error">{errores.nombre}</span>}
      </label>

      <label className="auth-field">
        Apellido
        <input
          type="text"
          name="apellido"
          placeholder="Tu apellido"
          value={datos.apellido}
          onChange={handleChange}
          aria-invalid={Boolean(errores.apellido)}
        />
        {errores.apellido && (
          <span className="auth-error">{errores.apellido}</span>
        )}
      </label>

      <label className="auth-field">
        Email
        <input
          type="email"
          name="email"
          placeholder="nombre@mail.com"
          value={datos.email}
          onChange={handleChange}
          aria-invalid={Boolean(errores.email)}
        />
        {errores.email && <span className="auth-error">{errores.email}</span>}
      </label>

      <label className="auth-field">
        Contraseña
        <input
          type="password"
          name="password"
          placeholder="Mínimo 8 caracteres"
          value={datos.password}
          onChange={handleChange}
          aria-invalid={Boolean(errores.password)}
        />
        {errores.password && (
          <span className="auth-error">{errores.password}</span>
        )}
      </label>

      <label className="auth-field">
        Repetir contraseña
        <input
          type="password"
          name="repetirPassword"
          placeholder="••••••••"
          value={datos.repetirPassword}
          onChange={handleChange}
          aria-invalid={Boolean(errores.repetirPassword)}
        />
        {errores.repetirPassword && (
          <span className="auth-error">{errores.repetirPassword}</span>
        )}
      </label>

      <label className="auth-field">
        Fecha de nacimiento
        <input
          type="date"
          name="fechaNacimiento"
          value={datos.fechaNacimiento}
          onChange={handleChange}
          aria-invalid={Boolean(errores.fechaNacimiento)}
        />
        {errores.fechaNacimiento && (
          <span className="auth-error">{errores.fechaNacimiento}</span>
        )}
      </label>

      <label className="auth-field">
        Sexo
        <select
          name="sexo"
          value={datos.sexo}
          onChange={handleChange}
          aria-invalid={Boolean(errores.sexo)}
        >
          <option value="">Elegí una opción</option>
          <option value="F">Femenino</option>
          <option value="M">Masculino</option>
          <option value="X">Otro</option>
          <option value="N">Prefiero no decirlo</option>
        </select>
        {errores.sexo && <span className="auth-error">{errores.sexo}</span>}
      </label>

      <button className="auth-submit" type="submit" disabled={cargando}>
        {cargando ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="auth-switch">
        ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </form>
  );
}

export default Registro;
