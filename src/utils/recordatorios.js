const HORAS_ANTICIPACION = 48;
const MS_POR_HORA = 60 * 60 * 1000;
const MS_POR_DIA = 24 * MS_POR_HORA;

function inicioDelDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function describirDia(fecha, ahora) {
  const diferencia = Math.round(
    (inicioDelDia(fecha) - inicioDelDia(ahora)) / MS_POR_DIA
  );

  if (diferencia === 0) return "Hoy";
  if (diferencia === 1) return "Mañana";

  const nombreDia = fecha.toLocaleDateString("es-AR", { weekday: "long" });
  return `El ${nombreDia}`;
}

export function armarRecordatorios(reservas, funciones, ahora = new Date()) {
  const limite = new Date(ahora.getTime() + HORAS_ANTICIPACION * MS_POR_HORA);

  return reservas
    .filter((reserva) => reserva.estado !== "CANCELADA")
    .map((reserva) => {
      const funcion = funciones.find((f) => f.id === reserva.idFuncion);
      return funcion
        ? { reserva, funcion, inicio: new Date(funcion.horarioInicio) }
        : null;
    })
    .filter((item) => item && item.inicio > ahora && item.inicio <= limite)
    .sort((a, b) => a.inicio - b.inicio)
    .map(({ reserva, funcion, inicio }) => ({
      id: reserva.idReserva,
      titulo: funcion.peliculaTitulo,
      cuando: `${describirDia(inicio, ahora)} a las ${funcion.horarioInicio.slice(11, 16)}`,
      sala: funcion.salaNombre,
      asientos: reserva.asientos.map((a) => `${a.fila}${a.numero}`),
    }));
}
