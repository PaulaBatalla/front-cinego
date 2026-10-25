import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { reservaService } from "../services/reservaService";
import { armarRecordatorios } from "../utils/recordatorios";

export function useRecordatorios() {
  const { isAuthenticated, token } = useAuth();
  const [resultado, setResultado] = useState({ token: null, recordatorios: [] });
  const [intento, setIntento] = useState(0);

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

  const recordatorios =
    isAuthenticated && resultado.token === token ? resultado.recordatorios : [];

  return { recordatorios, recargar };
}
