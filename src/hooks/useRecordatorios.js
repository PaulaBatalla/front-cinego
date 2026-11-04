import { useCallback, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useMisReservasQuery, useFuncionesQuery } from "../services/reservasApi";
import { armarRecordatorios } from "../utils/recordatorios";

function leerLeidos(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave)) || [];
  } catch {
    return [];
  }
}

export function useRecordatorios() {
  const { isAuthenticated, usuario } = useAuth();
  const reservas = useMisReservasQuery(undefined, { skip: !isAuthenticated });
  const funciones = useFuncionesQuery(undefined, { skip: !isAuthenticated });
  const clave = "recordatoriosLeidos:" + usuario?.email;
  const [lectura, setLectura] = useState(() => ({ clave, ids: leerLeidos(clave) }));
  const leidos = lectura.clave === clave ? lectura.ids : leerLeidos(clave);

  const recargar = () => {
    if (!isAuthenticated) return;
    reservas.refetch();
    funciones.refetch();
  };

  const actuales = useMemo(() => isAuthenticated && reservas.data && funciones.data
    ? armarRecordatorios(reservas.data, funciones.data)
    : [], [isAuthenticated, reservas.data, funciones.data]);

  const marcarLeidos = useCallback(() => {
    const ids = actuales.map((recordatorio) => recordatorio.id);
    localStorage.setItem(clave, JSON.stringify(ids));
    setLectura({ clave, ids });
  }, [actuales, clave]);

  const recordatorios = actuales.map((recordatorio) => ({
    ...recordatorio,
    leido: leidos.includes(recordatorio.id),
  }));
  const noLeidos = recordatorios.filter((recordatorio) => !recordatorio.leido).length;

  return { recordatorios, noLeidos, marcarLeidos, recargar };
}
