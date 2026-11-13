export const ANTICIPACION_CANCELACION_MS = 30 * 60 * 1000;

export function estadoCancelacion(reserva, funcion, ahora = Date.now()) {
  if (reserva.estado === "CANCELADA") return { permitido: false, motivo: "Esta reserva ya está cancelada." };
  if (!["PENDIENTE", "CONFIRMADA"].includes(reserva.estado)) return { permitido: false, motivo: "Este estado no permite cancelar la reserva." };
  const inicio = Date.parse(funcion?.horarioInicio);
  if (!Number.isFinite(inicio)) return { permitido: false, motivo: "No podemos verificar el horario de esta función." };
  const limite = inicio - ANTICIPACION_CANCELACION_MS;
  return { permitido: ahora <= limite, limite, motivo: ahora <= limite
    ? "Podés cancelar hasta 30 minutos antes de la función."
    : "El plazo para cancelar terminó: se requieren al menos 30 minutos de anticipación." };
}
