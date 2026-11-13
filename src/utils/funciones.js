// Minutos de limpieza que tiene que haber entre dos funciones de la misma sala
export const LIMPIEZA_MIN = 15;

// "2026-10-31" + "20:30" -> "2026-10-31T20:30:00" (lo que espera el back)
export function armarHorarioInicio(fecha, hora) {
  return `${fecha}T${hora}:00`;
}

// Funciones de la misma sala que se pisan con la nueva (duración + limpieza).
// excluirId deja afuera a la función que se está editando.
export function buscarSuperposiciones(
  { fecha, hora, salaId, duracion },
  funciones,
  duracionDe,
  excluirId
) {
  const inicio = Date.parse(armarHorarioInicio(fecha, hora));
  const minutos = Number(duracion);
  if (!Number.isFinite(inicio) || !Number.isFinite(minutos) || minutos <= 0) return [];
  const fin = inicio + (minutos + LIMPIEZA_MIN) * 60000;

  return funciones.filter((otra) => {
    if ((excluirId != null && String(otra.id) === String(excluirId)) || Number(otra.salaId) !== Number(salaId)) {
      return false;
    }
    const otraInicio = Date.parse(armarHorarioInicio(otra.fecha, otra.hora));
    const otraDuracion = Number(duracionDe(otra.peliculaId));
    if (!Number.isFinite(otraInicio) || !Number.isFinite(otraDuracion) || otraDuracion <= 0) return false;
    const otraFin = otraInicio + (otraDuracion + LIMPIEZA_MIN) * 60000;
    return inicio < otraFin && otraInicio < fin;
  });
}

// El precio que más se usa en esa sala, para completar el formulario
export function precioHabitual(funciones, salaId) {
  const veces = {};
  let mejor = "";

  funciones
    .filter((funcion) => funcion.salaId === Number(salaId))
    .forEach(({ precio }) => {
      const clave = String(Number(precio));
      veces[clave] = (veces[clave] || 0) + 1;
      if (!mejor || veces[clave] > veces[mejor]) mejor = clave;
    });

  return mejor;
}
