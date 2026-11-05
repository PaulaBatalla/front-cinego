export const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function solicitar(ruta, opciones = {}) {
  let respuesta;
  const token = localStorage.getItem("token");
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
    const mensaje = await respuesta.text();
    const error = new Error(
      [401, 403].includes(respuesta.status)
        ? "Iniciá sesión nuevamente para continuar."
        : mensaje || `No se pudo completar la solicitud (${respuesta.status}).`,
    );
    error.status = respuesta.status;
    throw error;
  }
  // Algunos endpoints no traen cuerpo: el 204 de películas o el DELETE de funciones (200 vacío)
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}
