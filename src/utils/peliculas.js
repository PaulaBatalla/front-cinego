// Colores del mockup para las películas que no tienen póster
const COLORES_POSTER = [
  "#7FB7BE",
  "#C9B6E4",
  "#F2C57C",
  "#F28C8C",
  "#A8C686",
  "#E3A587",
  "#9DB4E8",
  "#D9D2C3",
];

// Siempre el mismo color para la misma película
export function colorDePelicula(id = 0) {
  return COLORES_POSTER[Number(id) % COLORES_POSTER.length];
}

// 104 -> "1 h 44 min"
export function formatearDuracion(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  if (!horas) {
    return `${resto} min`;
  }

  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

// El back guarda la clasificación como número; en el panel es el puntaje de 0 a 10
export function formatearPuntaje(clasificacion) {
  return Number(clasificacion).toFixed(1);
}
