import { normalizarBusquedaRegex } from "../utils/busquedaRegex";
import PeliculaCard from "./PeliculaCard";

function PeliculasList({ peliculas, fallback, busqueda = "" }) {
  if (!peliculas.length) {
    return fallback ?? null;
  }

  const regex = busqueda.trim() ? normalizarBusquedaRegex(busqueda) : null;

  const peliculasFiltradas = regex
    ? peliculas.filter((pelicula) => pelicula.titulo && regex.test(pelicula.titulo))
    : peliculas;

  if (peliculasFiltradas.length === 0) {
    return (
      <p className="listado-status">
        No hay resultados para “{busqueda.trim()}”.
      </p>
    );
  }

  return (
    <section className="listado">
      {peliculasFiltradas.map((pelicula) => (
        <PeliculaCard key={pelicula.id} movie={pelicula} />
      ))}
    </section>
  );
}

export default PeliculasList;
