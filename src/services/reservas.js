export async function crearReserva({ funcionId, asientoIds }) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Falta iniciar sesión para crear una reserva");
  }

  if (!Number.isSafeInteger(funcionId) || funcionId <= 0) {
    throw new Error("La función debe tener un ID válido del backend");
  }

  if (
    !Array.isArray(asientoIds) ||
    asientoIds.length === 0 ||
    asientoIds.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    new Set(asientoIds).size !== asientoIds.length
  ) {
    throw new Error("Seleccioná asientos con IDs válidos y sin repetir");
  }

  const respuesta = await fetch("http://localhost:8080/api/reservas", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ funcionId, asientoIds }),
  });

  if (!respuesta.ok) {
    const mensaje = await respuesta.text();
    let detalle = mensaje;
    try {
      const error = JSON.parse(mensaje);
      detalle = error.message || error.detail || "";
    } catch {
      // El backend también devuelve errores como texto plano.
    }
    throw new Error(
      detalle || `Error al crear la reserva (${respuesta.status})`
    );
  }

  return respuesta.json();
}
