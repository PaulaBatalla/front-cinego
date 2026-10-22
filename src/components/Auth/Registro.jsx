import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { validarRegistro } from "../../utils/validaciones";
import CampoFormulario from "./CampoFormulario";
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

  const [errores, setErrores] = useState({});
  const [errorRegistro, setErrorRegistro] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorRegistro(null);

    const erroresEncontrados = validarRegistro(datos);
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    setCargando(true);

    try {
      await authService.registrar(datos);
      navigate("/login", { state: { registrado: true } });
    } catch (err) {
      setErrorRegistro(err.message);
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

      <CampoFormulario
        etiqueta="Nombre"
        name="nombre"
        placeholder="Tu nombre"
        value={datos.nombre}
        onChange={handleChange}
        error={errores.nombre}
      />

      <CampoFormulario
        etiqueta="Apellido"
        name="apellido"
        placeholder="Tu apellido"
        value={datos.apellido}
        onChange={handleChange}
        error={errores.apellido}
      />

      <CampoFormulario
        etiqueta="Email"
        type="email"
        name="email"
        placeholder="nombre@mail.com"
        value={datos.email}
        onChange={handleChange}
        error={errores.email}
      />

      <CampoFormulario
        etiqueta="Contraseña"
        type="password"
        name="password"
        placeholder="Mínimo 8 caracteres"
        value={datos.password}
        onChange={handleChange}
        error={errores.password}
      />

      <CampoFormulario
        etiqueta="Repetir contraseña"
        type="password"
        name="repetirPassword"
        placeholder="••••••••"
        value={datos.repetirPassword}
        onChange={handleChange}
        error={errores.repetirPassword}
      />

      <CampoFormulario
        etiqueta="Fecha de nacimiento"
        type="date"
        name="fechaNacimiento"
        value={datos.fechaNacimiento}
        onChange={handleChange}
        error={errores.fechaNacimiento}
      />

      <CampoFormulario
        etiqueta="Sexo"
        name="sexo"
        value={datos.sexo}
        onChange={handleChange}
        error={errores.sexo}
      >
        <option value="">Elegí una opción</option>
        <option value="F">Femenino</option>
        <option value="M">Masculino</option>
        <option value="X">Otro</option>
        <option value="N">Prefiero no decirlo</option>
      </CampoFormulario>

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
