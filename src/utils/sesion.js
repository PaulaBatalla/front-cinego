export function leerToken(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
    const datos = JSON.parse(new TextDecoder().decode(bytes));
    return Number.isFinite(datos.exp) && typeof datos.sub === "string" && datos.sub
      ? datos : null;
  } catch {
    return null;
  }
}

export function tokenVigente(token, ahora = Date.now()) {
  const datos = leerToken(token);
  return Boolean(datos && datos.exp * 1000 > ahora);
}
