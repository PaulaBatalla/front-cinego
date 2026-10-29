import { solicitar } from "./api";

export const salaService = {
  listar: (signal) => solicitar("/salas", { signal }),
};
