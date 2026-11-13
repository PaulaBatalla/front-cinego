import { solicitar } from "./api";

// En el back las promos se llaman "descuentos"
export const descuentoService = {
  listar: (signal) => solicitar("/descuentos", { signal }),
  crear: (datos) => solicitar("/descuentos", {
    method: "POST",
    body: JSON.stringify(datos),
  }),
  actualizar: (id, datos) => solicitar(`/descuentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  }),
  cambiarEstado: (id, activo) => solicitar(`/descuentos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  }),
  eliminar: (id) => solicitar(`/descuentos/${id}`, { method: "DELETE" }),
};
