import { solicitar } from "./api";

// En el back las promos se llaman "descuentos"
export const descuentoService = {
  listar: (signal) => solicitar("/descuentos", { signal }),
};
