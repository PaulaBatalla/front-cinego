import { useEffect, useState } from "react";
import { funcionDisponible } from "../utils/disponibilidadFunciones";

export function useFuncionesDisponibles(funciones) {
  const [ahora, setAhora] = useState(Date.now);
  useEffect(() => {
    // Actualiza incluso si el usuario deja la pantalla abierta hasta el inicio.
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    const actualizar = () => setAhora(Date.now());
    window.addEventListener("focus", actualizar);
    return () => {
      clearInterval(reloj);
      window.removeEventListener("focus", actualizar);
    };
  }, []);
  return funciones.filter((funcion) => funcionDisponible(funcion, ahora));
}
