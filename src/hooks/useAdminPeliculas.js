import { useEffect, useState } from "react";
import { peliculaService } from "../services/peliculaService";

// Datos de la sección Películas del panel
export function useAdminPeliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    peliculaService
      .listar()
      .then((datos) => {
        if (activo) setPeliculas(datos);
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = () => {
    setError("");
    setCargando(true);
    setIntento((actual) => actual + 1);
  };

  return { peliculas, cargando, error, reintentar };
}
