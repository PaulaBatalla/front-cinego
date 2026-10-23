// Escapa caracteres especiales de Regex en el input del usuario
export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Convierte cada vocal en una expresión que acepte sus versiones con o sin tilde
export const normalizarBusquedaRegex = (texto) => {
  const limpio = escapeRegExp(texto.trim());

  const mapaVocales = {
    a: "[aá]",
    e: "[eé]",
    i: "[ií]",
    o: "[oó]",
    u: "[uúü]",
  };

  const patron = limpio
    .toLowerCase()
    .replace(/[aeiou]/g, (vocal) => mapaVocales[vocal]);

  // 'i' hace que la búsqueda sea case-insensitive
  return new RegExp(patron, "i");
};
