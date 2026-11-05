import { solicitar } from "./api";

export const peliculaService = {
  listar: (signal) => solicitar("/peliculas", { signal }),
  crear: (datos) => solicitar("/peliculas", {
    method: "POST",
    body: JSON.stringify(datos),
  }),
  actualizar: (id, datos) => solicitar(`/peliculas/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  }),
  eliminar: (id) => solicitar(`/peliculas/${id}`, { method: "DELETE" }),
};
