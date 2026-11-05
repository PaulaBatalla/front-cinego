import { tokenVigente } from "../utils/sesion";
import { avisarSesionVencida } from "./sesionService";
export const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function solicitar(ruta, opciones = {}) {
  let respuesta;
  const token = localStorage.getItem("token");
  if (token && !tokenVigente(token)) {
    avisarSesionVencida(token);
    const error = new Error("Tu sesión venció. Iniciá sesión nuevamente.");
    error.status = 401;
    throw error;
  }
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opciones.body ? { "Content-Type": "application/json" } : {}),
        ...opciones.headers,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  if (!respuesta.ok) {
    if (respuesta.status === 401 || (respuesta.status === 403 && token && !tokenVigente(token))) {
      avisarSesionVencida(token);
    }
    const mensaje = await respuesta.text();
    const error = new Error(
      respuesta.status === 401
        ? "Iniciá sesión nuevamente para continuar."
        : respuesta.status === 403
          ? "No tenés permisos para realizar esta acción."
          : mensaje || `No se pudo completar la solicitud (${respuesta.status}).`,
    );
    error.status = respuesta.status;
    throw error;
  }
  // Algunos endpoints no traen cuerpo: el 204 de películas o el DELETE de funciones (200 vacío)
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}
