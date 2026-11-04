import { solicitar } from "./api";

export const carritoService = {
  obtener: (signal) => solicitar("/carrito", { signal }),
  agregar: (candyId, cantidad = 1) =>
    solicitar("/carrito", {
      method: "POST",
      body: JSON.stringify({ candyId, cantidad }),
    }),
  eliminar: (idCarrito) =>
    solicitar(`/carrito/${idCarrito}`, {
      method: "DELETE",
    }),
  actualizarCantidad: async (idCarrito, candyId, nuevaCantidad) => {
    await solicitar(`/carrito/${idCarrito}`, { method: "DELETE" });
    if (nuevaCantidad > 0) {
      return await solicitar("/carrito", {
        method: "POST",
        body: JSON.stringify({ candyId, cantidad: nuevaCantidad }),
      });
    }
    return null;
  },
  vaciar: async (items) => {
    await Promise.all(
      items.map((item) =>
        solicitar(`/carrito/${item.id}`, { method: "DELETE" })
      )
    );
  },
};

export const candyService = {
  obtenerTodos: (signal) => solicitar("/candy", { signal }),
  obtenerPorId: (id, signal) => solicitar(`/candy/${id}`, { signal }),
};

