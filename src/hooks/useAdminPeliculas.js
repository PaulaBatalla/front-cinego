import { useEffect, useState } from "react";
import { peliculaService } from "../services/peliculaService";
import { reservaService } from "../services/reservaService";
import { useNotificaciones } from "./useNotificaciones";

// Datos de la sección Películas del panel
export function useAdminPeliculas() {
  const { notificar } = useNotificaciones();
  const [peliculas, setPeliculas] = useState([]);
  const [funciones, setFunciones] = useState([]);
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

  const eliminar = async (pelicula) => {
    try {
      await peliculaService.eliminar(pelicula.id);
      setPeliculas((actuales) => actuales.filter((p) => p.id !== pelicula.id));
      notificar(`“${pelicula.titulo}” eliminada`);
    } catch (err) {
      notificar(`No se pudo eliminar “${pelicula.titulo}”. ${err.message}`, "error", {
        duracion: 6000,
      });
    }
  };

  return { peliculas, cargando, error, reintentar, funcionesDe, guardar, eliminar };
}
