// El cliente HTTP comunica el rechazo sin importar el store (evita un ciclo).
let alVencer = () => {};
export function configurarSesionVencida(callback) {
  alVencer = callback;
}
export function avisarSesionVencida(token) {
  if (token) alVencer(token);
}
