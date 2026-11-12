// La API entrega horario local del cine cuando no incluye zona horaria.
export function funcionDisponible(funcion, ahora = Date.now()) {
  const inicio = Date.parse(funcion.horarioInicio);
  return Number.isFinite(inicio) && inicio > ahora;
}
