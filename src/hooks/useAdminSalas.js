import { useEffect, useState } from "react";
import { funcionService } from "../services/funcionService";
import { salaService } from "../services/salaService";
import { useNotificaciones } from "./useNotificaciones";

export function useAdminSalas() {
  const { notificar } = useNotificaciones();
  const [salas, setSalas] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    // Las funciones sirven para mostrar cuántas tiene cada sala y no dejar borrar las que tienen
    Promise.all([salaService.listar(), funcionService.listar()])
      .then(([datosSalas, datosFunciones]) => {
        if (!activo) return;
        setSalas(datosSalas);
        setFunciones(datosFunciones);
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

  const funcionesDe = (salaId) => funciones.filter((funcion) => funcion.salaId === salaId).length;

  const guardar = async (datos, id) => {
    if (id) {
      const actualizada = await salaService.actualizar(id, datos);
      setSalas((actuales) => actuales.map((s) => (s.id === id ? actualizada : s)));
      notificar("Sala actualizada");
      return;
    }

    const creada = await salaService.crear(datos);
    setSalas((actuales) => [...actuales, creada]);
    notificar(`“${creada.nombre}” agregada`);
  };

  const eliminar = async (sala) => {
    try {
      await salaService.eliminar(sala.id);
      setSalas((actuales) => actuales.filter((s) => s.id !== sala.id));
      notificar(`“${sala.nombre}” eliminada`);
    } catch (err) {
      notificar(`No se pudo eliminar “${sala.nombre}”. ${err.message}`, "error", {
        duracion: 6000,
      });
    }
  };

  return { salas, cargando, error, reintentar, funcionesDe, guardar, eliminar };
}
