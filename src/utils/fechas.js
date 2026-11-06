// Las fechas del panel se manejan como texto "YYYY-MM-DD" (igual que el input date)
// y los horarios como "HH:MM", así no hay corrimientos por zona horaria.

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function aIso(fecha) {
  // "en-CA" da la fecha local como YYYY-MM-DD
  return fecha.toLocaleDateString("en-CA");
}

function leerIso(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function hoyIso() {
  return aIso(new Date());
}

export function sumarDias(iso, cantidad) {
  const fecha = leerIso(iso);
  fecha.setDate(fecha.getDate() + cantidad);
  return aIso(fecha);
}

// "Hoy", "Mañana" o "Vie 31 oct"
export function etiquetaDia(iso) {
  const hoy = hoyIso();
  if (iso === hoy) return "Hoy";
  if (iso === sumarDias(hoy, 1)) return "Mañana";

  const fecha = leerIso(iso);
  return `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()} ${MESES[fecha.getMonth()].slice(0, 3)}`;
}

// "Viernes 31 de octubre", con " (hoy)" si corresponde
export function fechaLarga(iso, { conHoy = true } = {}) {
  const fecha = leerIso(iso);
  const texto = `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  return conHoy && iso === hoyIso() ? `${texto} (hoy)` : texto;
}

// "20:30" -> 1230
export function aMinutos(hora) {
  if (!/^\d{1,2}:\d{2}$/.test(hora || "")) return null;
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

// 1230 -> "20:30" (pasada la medianoche vuelve a empezar: 1500 -> "01:00")
export function formatearMinutos(total) {
  const minutosDelDia = ((total % 1440) + 1440) % 1440;
  const horas = String(Math.floor(minutosDelDia / 60)).padStart(2, "0");
  const minutos = String(minutosDelDia % 60).padStart(2, "0");
  return `${horas}:${minutos}`;
}

// 8500 -> "$ 8.500"
export function formatearPrecio(precio) {
  return `$ ${Math.round(Number(precio)).toLocaleString("es-AR")}`;
}
