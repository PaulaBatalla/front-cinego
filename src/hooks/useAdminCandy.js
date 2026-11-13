import { useEffect, useState } from "react";
import { candyService } from "../services/candyService";
import { useNotificaciones } from "./useNotificaciones";

export function useAdminCandy() {
  const { notificar } = useNotificaciones();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    candyService
      .listar(controlador.signal)
      .then((datos) => setProductos(datos ?? []))
      .catch((err) => {
        // solicitar() convierte el abort en otro Error, por eso miramos la señal
        if (!controlador.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [intento]);

  const reintentar = () => {
    setError("");
    setCargando(true);
    setIntento((actual) => actual + 1);
  };

  const guardar = async (datos, id) => {
    if (id) {
      const actualizado = await candyService.actualizar(id, datos);
      setProductos((actuales) => actuales.map((p) => (p.id === id ? actualizado : p)));
      notificar("Cambios guardados");
      return;
    }

    const creado = await candyService.crear(datos);
    setProductos((actuales) => [...actuales, creado]);
    notificar(`“${creado.nombre}” agregado al Candy`);
  };

  const eliminar = async (producto) => {
    try {
      await candyService.eliminar(producto.id);
      setProductos((actuales) => actuales.filter((p) => p.id !== producto.id));
      notificar(`“${producto.nombre}” eliminado`);
    } catch (err) {
      notificar(`No se pudo eliminar “${producto.nombre}”. ${err.message}`, "error", {
        duracion: 6000,
      });
    }
  };

  return { productos, cargando, error, reintentar, guardar, eliminar };
}
