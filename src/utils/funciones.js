import { aMinutos } from "./fechas";

// Minutos de limpieza que tiene que haber entre dos funciones de la misma sala
export const LIMPIEZA_MIN = 15;

// "2026-10-31" + "20:30" -> "2026-10-31T20:30:00" (lo que espera el back)
export function armarHorarioInicio(fecha, hora) {
  return `${fecha}T${hora}:00`;
}

// Funciones de la misma sala y fecha que se pisan con la nueva (duración + limpieza).
// excluirId deja afuera a la función que se está editando.
export function buscarSuperposiciones(
  { fecha, hora, salaId, duracion },
  funciones,
  duracionDe,
  excluirId
) {
  const inicio = aMinutos(hora);
  if (inicio === null || !duracion) return [];
  const fin = inicio + duracion;

  return funciones.filter((otra) => {
    if (otra.id === excluirId || otra.fecha !== fecha || otra.salaId !== Number(salaId)) {
      return false;
    }
    const otraInicio = aMinutos(otra.hora);
    const otraFin = otraInicio + duracionDe(otra.peliculaId);
    return inicio < otraFin + LIMPIEZA_MIN && otraInicio < fin + LIMPIEZA_MIN;
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
