import { useEffect, useState } from "react";
import { funcionService } from "../services/funcionService";
import { peliculaService } from "../services/peliculaService";
import { salaService } from "../services/salaService";

// El back manda "2026-10-31T20:30:00": se separa en fecha y hora para el panel
function prepararFuncion(funcion) {
  return {
    ...funcion,
    fecha: funcion.horarioInicio.slice(0, 10),
    hora: funcion.horarioInicio.slice(11, 16),
  };
}

// Datos de la sección Funciones del panel
export function useAdminFunciones() {
  const [funciones, setFunciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    Promise.all([funcionService.listar(), peliculaService.listar(), salaService.listar()])
      .then(([datosFunciones, datosPeliculas, datosSalas]) => {
        if (!activo) return;
        setFunciones(datosFunciones.map(prepararFuncion));
        setPeliculas(datosPeliculas);
        setSalas(datosSalas);
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

  return { funciones, peliculas, salas, cargando, error, reintentar };
}
