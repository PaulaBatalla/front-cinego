// Permite comprobar la sesión sin que el cliente HTTP importe el store.
let obtenerVersion = () => 0;
let alRechazar = () => {};

export function configurarControlSesion(version, rechazo) {
  obtenerVersion = version;
  alRechazar = rechazo;
}

export const versionActual = () => obtenerVersion();
export const avisarSesionRechazada = (version) => alRechazar(version);
