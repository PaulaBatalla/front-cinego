import PeliculaCard from "./PeliculaCard";

function PeliculasList({
  peliculas = [],
  fallback,
  hayFiltrosActivos = false,
  onLimpiarFiltros,
}) {
  if (peliculas.length === 0) {
    if (hayFiltrosActivos) {
      return (
        <div className="listado-vacio" style={{ padding: "2rem 0", textAlign: "left" }}>
          <p className="listado-status" style={{ marginBottom: "1rem" }}>
            No se encontraron películas para los filtros seleccionados.
          </p>
          {onLimpiarFiltros && (
            <button
              type="button"
              className="filtro-limpiar-btn"
              onClick={onLimpiarFiltros}
              style={{ padding: "8px 14px", fontSize: "0.85rem" }}
            >
              Restablecer filtros
            </button>
          )}
        </div>
      );
    }
    return fallback ?? null;
  }

  return (
    <section className="listado">
      {peliculas.map((pelicula) => (
        <PeliculaCard key={pelicula.id} movie={pelicula} />
      ))}
    </section>
  );
}

export default PeliculasList;
