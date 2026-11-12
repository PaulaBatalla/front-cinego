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

export function validarPelicula(datos) {
  const errores = {};

  if (!datos.titulo.trim()) {
    errores.titulo = "Escribí el título de la película.";
  }

  const duracion = Number(datos.duracion);
  if (!Number.isInteger(duracion) || duracion <= 0) {
    errores.duracion = "Ingresá los minutos (ej: 104).";
  }

  const edad = Number(datos.clasificacion);
  if (!String(datos.clasificacion ?? "").trim() || !Number.isInteger(edad) || edad < 0) {
    errores.clasificacion = "Ingresá una edad entera mayor o igual a 0 (0 para ATP).";
  }

  return errores;
}

export function validarFuncion(datos) {
  const errores = {};

  if (!datos.peliculaId) {
    errores.peliculaId = "Elegí la película.";
  }

  if (!datos.salaId) {
    errores.salaId = "Elegí la sala.";
  }

  if (!datos.fechas.length) {
    errores.fechas = "Elegí al menos una fecha.";
  }

  if (!/^\d{2}:\d{2}$/.test(datos.hora)) {
    errores.hora = "Elegí a qué hora empieza.";
  }

  if (!(Number(datos.precio) > 0)) {
    errores.precio = "Ingresá un precio mayor a 0.";
  }

  return errores;
}

export const MAX_FILAS = 30;
export const MAX_ASIENTOS_POR_FILA = 40;

export function validarSala(datos) {
  const errores = {};

  if (!datos.nombre.trim()) {
    errores.nombre = "Escribí el nombre de la sala.";
  }

  const filas = Number(datos.filas);
  if (!Number.isInteger(filas) || filas < 1 || filas > MAX_FILAS) {
    errores.filas = `Entre 1 y ${MAX_FILAS} filas.`;
  }

  const asientos = Number(datos.asientosPorFila);
  if (!Number.isInteger(asientos) || asientos < 1 || asientos > MAX_ASIENTOS_POR_FILA) {
    errores.asientosPorFila = `Entre 1 y ${MAX_ASIENTOS_POR_FILA} asientos.`;
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
