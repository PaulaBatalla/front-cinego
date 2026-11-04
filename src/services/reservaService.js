import { solicitar } from "./api";

export const reservaService = {
  peliculas: (signal) => solicitar("/peliculas", { signal }),
  funciones: (signal) => solicitar("/funciones", { signal }),
  asientos: (funcionId, signal) => solicitar(`/funciones/${funcionId}/asientos`, { signal }),
  misReservas: (signal) => solicitar("/reservas/mis-reservas", { signal }),
  crear: (funcionId, asientoIds) => solicitar("/reservas", {
    method: "POST",
    body: JSON.stringify({ funcionId, asientoIds }),
  }),
};
