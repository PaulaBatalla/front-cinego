import { solicitar } from "./api";

export const candyService = {
  listar: (signal) => solicitar("/candy", { signal }),
  obtener: (id) => solicitar(`/candy/${id}`),
  crear: (datos) => solicitar("/candy", {
    method: "POST",
    body: JSON.stringify(datos),
  }),
  actualizar: (id, datos) => solicitar(`/candy/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  }),
  eliminar: (id) => solicitar(`/candy/${id}`, { method: "DELETE" }),
};
