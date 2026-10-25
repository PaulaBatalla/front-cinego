import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { reservaService } from "../services/reservaService";
import { armarRecordatorios } from "../utils/recordatorios";

function leerLeidos(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave)) || [];
  } catch {
    return [];
  }
}

export function useRecordatorios() {
  const { isAuthenticated, token, usuario } = useAuth();
  const [resultado, setResultado] = useState({ token: null, recordatorios: [] });
  const [intento, setIntento] = useState(0);
  const clave = `recordatoriosLeidos:${usuario?.email}`;
  const [leidos, setLeidos] = useState(() => leerLeidos(clave));

  useEffect(() => {
    if (!isAuthenticated) return;

    const controlador = new AbortController();

    Promise.all([
      reservaService.misReservas(controlador.signal),
      reservaService.funciones(controlador.signal),
    ])
      .then(([reservas, funciones]) => {
        setResultado({ token, recordatorios: armarRecordatorios(reservas, funciones) });
      })
      .catch(() => {});

    return () => controlador.abort();
  }, [isAuthenticated, token, intento]);

  const recargar = useCallback(() => setIntento((actual) => actual + 1), []);

  const actuales =
    isAuthenticated && resultado.token === token ? resultado.recordatorios : [];

  const marcarLeidos = useCallback(() => {
    const ids = actuales.map((recordatorio) => recordatorio.id);
    localStorage.setItem(clave, JSON.stringify(ids));
    setLeidos(ids);
  }, [actuales, clave]);

  const recordatorios = actuales.map((recordatorio) => ({
    ...recordatorio,
    leido: leidos.includes(recordatorio.id),
  }));
  const noLeidos = recordatorios.filter((recordatorio) => !recordatorio.leido).length;

  return { recordatorios, noLeidos, marcarLeidos, recargar };
}
