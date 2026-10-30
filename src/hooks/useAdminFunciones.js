import { useEffect, useState } from "react";
import { funcionService } from "../services/funcionService";
import { peliculaService } from "../services/peliculaService";
import { salaService } from "../services/salaService";
import { armarHorarioInicio } from "../utils/funciones";
import { useNotificaciones } from "./useNotificaciones";

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
  const { notificar } = useNotificaciones();
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

  // datos: { peliculaId, salaId, hora, precio }. Al crear hay una función por cada fecha.
  const guardar = async ({ peliculaId, salaId, hora, precio }, fechas, id) => {
    const armar = (fecha) => ({
      peliculaId: Number(peliculaId),
      salaId: Number(salaId),
      horarioInicio: armarHorarioInicio(fecha, hora),
      precio: Number(precio),
    });

    if (id) {
      const actualizada = prepararFuncion(await funcionService.actualizar(id, armar(fechas[0])));
      setFunciones((actuales) => actuales.map((f) => (f.id === id ? actualizada : f)));
      notificar("Cambios guardados");
      return;
    }

    const resultados = await Promise.allSettled(
      fechas.map((fecha) => funcionService.crear(armar(fecha)))
    );
    const creadas = resultados
      .filter((r) => r.status === "fulfilled")
      .map((r) => prepararFuncion(r.value));
    const fallo = resultados.find((r) => r.status === "rejected");

    // Si no se pudo crear ninguna, el formulario muestra el error y queda abierto
    if (!creadas.length) {
      throw fallo.reason;
    }

    setFunciones((actuales) => [...actuales, ...creadas]);
    notificar(
      creadas.length === 1 ? "Se agregó la función" : `Se agregaron ${creadas.length} funciones`
    );

    if (fallo) {
      const cantidad = fechas.length - creadas.length;
      notificar(
        `No se ${cantidad === 1 ? "pudo agregar 1 función" : `pudieron agregar ${cantidad} funciones`}. ${fallo.reason.message}`,
        "error",
        { duracion: 6000 }
      );
    }
  };

  const eliminar = async (funcion) => {
    try {
      await funcionService.eliminar(funcion.id);
      setFunciones((actuales) => actuales.filter((f) => f.id !== funcion.id));
      notificar("Función eliminada");
    } catch (err) {
      notificar(
        `No se pudo eliminar la función. ${err.message} Puede que ya tenga entradas vendidas.`,
        "error",
        { duracion: 6000 }
      );
    }
  };

  return { funciones, peliculas, salas, cargando, error, reintentar, guardar, eliminar };
}
