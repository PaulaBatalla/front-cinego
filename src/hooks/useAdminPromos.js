import { useEffect, useState } from "react";
import { descuentoService } from "../services/descuentoService";
import { peliculaService } from "../services/peliculaService";
import { useNotificaciones } from "./useNotificaciones";

export function useAdminPromos() {
  const { notificar } = useNotificaciones();
  const [promos, setPromos] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    // Las películas sirven para elegir a cuáles se aplica una promo
    Promise.all([descuentoService.listar(), peliculaService.listar()])
      .then(([datosPromos, datosPeliculas]) => {
        if (!activo) return;
        setPromos(datosPromos ?? []);
        setPeliculas(datosPeliculas ?? []);
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

  const reemplazar = (actualizada) => {
    setPromos((actuales) => actuales.map((p) => (p.id === actualizada.id ? actualizada : p)));
  };

  const guardar = async (datos, id) => {
    if (id) {
      reemplazar(await descuentoService.actualizar(id, datos));
      notificar("Promo actualizada");
      return;
    }

    const creada = await descuentoService.crear(datos);
    setPromos((actuales) => [...actuales, creada]);
    notificar(`“${creada.nombre}” agregada`);
  };

  const cambiarEstado = async (promo) => {
    try {
      reemplazar(await descuentoService.cambiarEstado(promo.id, !promo.activo));
      notificar(promo.activo ? `“${promo.nombre}” pausada` : `“${promo.nombre}” activada`);
    } catch (err) {
      notificar(`No se pudo cambiar “${promo.nombre}”. ${err.message}`, "error", {
        duracion: 6000,
      });
    }
  };

  const eliminar = async (promo) => {
    try {
      await descuentoService.eliminar(promo.id);
      setPromos((actuales) => actuales.filter((p) => p.id !== promo.id));
      notificar(`“${promo.nombre}” eliminada`);
    } catch (err) {
      notificar(`No se pudo eliminar “${promo.nombre}”. ${err.message}`, "error", {
        duracion: 6000,
      });
    }
  };

  return { promos, peliculas, cargando, error, reintentar, guardar, cambiarEstado, eliminar };
}
