import { solicitar } from "./api";

export const funcionService = {
  listar: (signal) => solicitar("/funciones", { signal }),
  crear: (datos) => solicitar("/funciones", {
    method: "POST",
    body: JSON.stringify(datos),
  }),
  actualizar: (id, datos) => solicitar(`/funciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  }),
  eliminar: (id) => solicitar(`/funciones/${id}`, { method: "DELETE" }),
};
