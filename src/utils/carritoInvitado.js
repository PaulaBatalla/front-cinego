// Carrito de quien no inició sesión: se guarda en localStorage para no perderlo al recargar la página.
// El de un usuario logueado no se guarda acá porque ya está en el back.
const CLAVE = "carritoInvitado";

export function leerCarritoInvitado() {
  try {
    const items = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(items) ? items.filter((item) => item?.local && item.cantidad > 0) : [];
  } catch {
    // Dato corrupto o navegador sin localStorage: se arranca con el carrito vacío
    return [];
  }
}

// Recibe todos los items del carrito y guarda solo los agregados sin sesión
export function guardarCarritoInvitado(items) {
  try {
    const locales = items.filter((item) => item.local);
    if (locales.length > 0) {
      localStorage.setItem(CLAVE, JSON.stringify(locales));
    } else {
      localStorage.removeItem(CLAVE);
    }
  } catch {
    // Sin localStorage (modo privado, tests) el carrito solo vive en memoria
  }
}
