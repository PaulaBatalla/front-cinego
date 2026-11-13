// 15 -> "−15%" (con el signo menos tipográfico, como en el mockup)
export function formatearPorcentaje(porcentaje) {
  return `−${Math.round(Number(porcentaje))}%`;
}

// A qué películas se aplica la promo, en una línea
export function textoAplica(promo) {
  if (promo.aplicaATodas) {
    return "Todas las películas";
  }

  const titulos = promo.peliculaNombres ?? [];

  if (titulos.length === 0) {
    return "Ninguna película";
  }

  return titulos.length <= 2 ? titulos.join(" y ") : `${titulos.length} películas`;
}
