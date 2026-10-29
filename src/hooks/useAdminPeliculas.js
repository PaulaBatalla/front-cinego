import { useCallback, useEffect, useRef, useState } from "react";
import { peliculaService } from "../services/peliculaService";
import { reservaService } from "../services/reservaService";
import { useNotificaciones } from "./useNotificaciones";

// Tiempo que tiene el admin para tocar "Deshacer" antes de que se borre en el back
const DESHACER_MS = 5000;

// Vuelve a poner la película en el lugar que tenía en la lista
function reinsertar(lista, pelicula, indice) {
  if (lista.some((p) => p.id === pelicula.id)) return lista;
  const copia = [...lista];
  copia.splice(Math.min(indice, copia.length), 0, pelicula);
  return copia;
}

// Datos de la sección Películas del panel
export function useAdminPeliculas() {
  const { notificar } = useNotificaciones();
  const [peliculas, setPeliculas] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  // Borrados esperando a que pasen los 5 s: id -> { timeout, ejecutar }
  const pendientes = useRef(new Map());

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

    // Solo sirven para avisar cuántas funciones tiene una película al eliminarla
    reservaService
      .funciones()
      .then((datos) => {
        if (activo) setFunciones(datos);
      })
      .catch(() => {});

    return () => {
      activo = false;
    };
  }, [intento]);

  // Si el admin se va de la sección, los borrados pendientes se mandan igual
  useEffect(() => {
    const borrados = pendientes.current;
    return () => {
      borrados.forEach(({ timeout, ejecutar }) => {
        clearTimeout(timeout);
        ejecutar();
      });
      borrados.clear();
    };
  }, []);

  const reintentar = () => {
    setError("");
    setCargando(true);
    setIntento((actual) => actual + 1);
  };

  const funcionesDe = (peliculaId) =>
    funciones.filter((funcion) => funcion.peliculaId === peliculaId).length;

  const guardar = async (datos, id) => {
    if (id) {
      const actualizada = await peliculaService.actualizar(id, datos);
      setPeliculas((actuales) => actuales.map((p) => (p.id === id ? actualizada : p)));
      notificar("Cambios guardados");
      return;
    }

    const creada = await peliculaService.crear(datos);
    setPeliculas((actuales) => [creada, ...actuales]);
    notificar(`“${creada.titulo}” ya está en cartelera`);
  };

  const deshacer = useCallback((pelicula, indice) => {
    const pendiente = pendientes.current.get(pelicula.id);
    if (!pendiente) return;

    clearTimeout(pendiente.timeout);
    pendientes.current.delete(pelicula.id);
    setPeliculas((actuales) => reinsertar(actuales, pelicula, indice));
  }, []);

  const eliminar = (pelicula) => {
    const indice = peliculas.findIndex((p) => p.id === pelicula.id);
    setPeliculas((actuales) => actuales.filter((p) => p.id !== pelicula.id));

    const ejecutar = async () => {
      pendientes.current.delete(pelicula.id);
      try {
        await peliculaService.eliminar(pelicula.id);
      } catch (err) {
        setPeliculas((actuales) => reinsertar(actuales, pelicula, indice));
        notificar(`No se pudo eliminar “${pelicula.titulo}”. ${err.message}`, "error", {
          duracion: 6000,
        });
      }
    };

    pendientes.current.set(pelicula.id, {
      timeout: setTimeout(ejecutar, DESHACER_MS),
      ejecutar,
    });

    notificar(`“${pelicula.titulo}” eliminada`, "exito", {
      duracion: DESHACER_MS,
      accion: { texto: "Deshacer", onClick: () => deshacer(pelicula, indice) },
    });
  };

  return { peliculas, cargando, error, reintentar, funcionesDe, guardar, eliminar };
}
