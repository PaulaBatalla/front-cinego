// Devuelve el mensaje de error del email, o null si está bien
function validarEmail(email) {
  if (!email.trim()) {
    return "Ingresá tu email.";
  }

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return "Ingresá un email válido.";
  }

  return null;
}

export function validarLogin(email, password) {
  const errores = {};

  const errorEmail = validarEmail(email);
  if (errorEmail) {
    errores.email = errorEmail;
  }

  if (!password) {
    errores.password = "Ingresá tu contraseña.";
  }

  return errores;
}

// Acepta "8,1" y "8.1" para el puntaje
export function leerDecimal(texto) {
  return parseFloat(String(texto).replace(",", "."));
}

export function validarPelicula(datos) {
  const errores = {};

  if (!datos.titulo.trim()) {
    errores.titulo = "Escribí el título de la película.";
  }

  const duracion = Number(datos.duracion);
  if (!Number.isInteger(duracion) || duracion <= 0) {
    errores.duracion = "Ingresá los minutos (ej: 104).";
  }

  const puntaje = leerDecimal(datos.clasificacion);
  if (!(puntaje >= 0 && puntaje <= 10)) {
    errores.clasificacion = "Tiene que ser un número entre 0 y 10.";
  }

  return errores;
}

export function validarRegistro(datos) {
  const errores = {};

  if (!datos.nombre.trim()) {
    errores.nombre = "Ingresá tu nombre.";
  }

  if (!datos.apellido.trim()) {
    errores.apellido = "Ingresá tu apellido.";
  }

  const errorEmail = validarEmail(datos.email);
  if (errorEmail) {
    errores.email = errorEmail;
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
