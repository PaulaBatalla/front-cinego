import { useEffect, useState } from "react";
import CandyItemsFallback from "../data/candy.json";
import { candyService } from "../services/carritoService";

function enriquecerProductoCandy(producto) {
  const nombreMin = (producto.nombre || "").toLowerCase();
  let categoria = producto.categoria;
  let icono = producto.icono;
  let color = producto.color;

  if (!categoria) {
    if (nombreMin.includes("combo")) {
      categoria = "Combos";
      icono = icono || "combo";
      color = color || "#f6d895";
    } else if (nombreMin.includes("pochoclo")) {
      categoria = "Pochoclos";
      icono = icono || "pochoclo";
      color = color || "#ebe4d7";
    } else if (nombreMin.includes("gaseosa") || nombreMin.includes("bebida")) {
      categoria = "Bebidas";
      icono = icono || "bebida";
      color = color || "#a2a9d6";
    } else if (nombreMin.includes("nacho")) {
      categoria = "Dulces";
      icono = icono || "nachos";
      color = color || "#a3ca97";
    } else {
      categoria = "Combos";
      icono = icono || "combo";
      color = color || "#87c9cc";
    }
  }

  return {
    ...producto,
    categoria,
    icono: icono || "combo",
    color: color || "#f6d895",
  };
}

export function useCandy() {
  const [candy, setCandy] = useState(() => CandyItemsFallback.map(enriquecerProductoCandy));
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    const controller = new AbortController();

    candyService
      .obtenerTodos(controller.signal)
      .then((datos) => {
        if (activo && Array.isArray(datos) && datos.length > 0) {
          setCandy(datos.map(enriquecerProductoCandy));
          setCargando(false);
        }
      })
      .catch((err) => {
        if (activo) {
          setError(err.message);
          setCargando(false);
        }
      });

    return () => {
      activo = false;
      controller.abort();
    };
  }, []);

  return { candy, cargando, error };
}
