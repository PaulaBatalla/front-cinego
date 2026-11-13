import { solicitar } from "./api";

export const salaService = {
  listar: (signal) => solicitar("/salas", { signal }),
  crear: (datos) => solicitar("/salas", {
    method: "POST",
    body: JSON.stringify(datos),
  }),
  actualizar: (id, datos) => solicitar(`/salas/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  }),
  eliminar: (id) => solicitar(`/salas/${id}`, { method: "DELETE" }),
};
