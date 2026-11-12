export function agruparReservas(reservas, funciones, ahora = Date.now()) {
  const porId = new Map(funciones.map((f) => [String(f.id), f]));
  const grupos = { proximas: [], pasadas: [], canceladas: [], sinHorario: [] };
  for (const reserva of reservas) {
    const funcion = porId.get(String(reserva.idFuncion));
    const inicio = Date.parse(funcion?.horarioInicio);
    const grupo = reserva.estado === "CANCELADA" ? "canceladas"
      : !Number.isFinite(inicio) ? "sinHorario" : inicio > ahora ? "proximas" : "pasadas";
    grupos[grupo].push({ reserva, funcion, inicio });
  }
  grupos.proximas.sort((a, b) => a.inicio - b.inicio || a.reserva.idReserva - b.reserva.idReserva);
  grupos.pasadas.sort((a, b) => b.inicio - a.inicio || b.reserva.idReserva - a.reserva.idReserva);
  const recientes = (a, b) => (Date.parse(b.reserva.fechaReserva) || 0) - (Date.parse(a.reserva.fechaReserva) || 0) || b.reserva.idReserva - a.reserva.idReserva;
  grupos.canceladas.sort(recientes);
  grupos.sinHorario.sort(recientes);
  return grupos;
}
