import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useFuncionesQuery } from "../services/reservasApi";

// Los enlaces anteriores continúan en el único flujo de reserva.
export default function ReservaPage() {
  const [params] = useSearchParams();
  const funcionId = params.get("funcionId");
  const { data: funciones, error, refetch } = useFuncionesQuery(undefined, { skip: !funcionId });
  if (!funcionId) return <Navigate to="/" replace />;
  if (error) return <main><p role="alert">{error.message}</p><button onClick={refetch}>Reintentar</button></main>;
  if (!funciones) return <p role="status">Cargando función...</p>;
  const funcion = funciones.find((f) => String(f.id) === funcionId);
  if (!funcion) return <main><p>La función no existe.</p><Link to="/">Elegir otra función</Link></main>;
  return <Navigate to={`/pelicula/${funcion.peliculaId}?funcionId=${encodeURIComponent(funcion.id)}`} replace />;
}
