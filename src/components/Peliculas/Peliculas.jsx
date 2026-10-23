import { useEffect, useState } from "react";
import PeliculaCard from "./PeliculaCard";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPeliculas = async () => {
      try {
        const respuesta = await fetch("http://localhost:8080/api/peliculas", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!respuesta.ok) {
          throw new Error(`Error al cargar las películas (${respuesta.status})`);
        }

        const datos = await respuesta.json();
        setPeliculas(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarPeliculas();
  }, []);

  return (
    <main className="home-content">
      <section className="featured-movie" aria-label="Película destacada">
        <div className="featured-poster">
          <span className="featured-poster-label">Posterul</span>
          <p className="featured-poster-title">La Última Función</p>
        </div>
        <div className="featured-info">
          <span className="featured-eyebrow">Destacada de la semana</span>
          <h1>La Última Función</h1>
          <p className="featured-meta"><strong>★ 8.1</strong> · 1 h 44 min</p>
          <p className="featured-description">
            El proyectorista de un cine de barrio prepara la función de despedida
            antes del cierre definitivo.
          </p>
          <div className="featured-actions">
            <a href="#cartelera">Comprar entradas <span aria-hidden="true">&nbsp;→</span></a>
            <a href="#cartelera">Ver detalle</a>
          </div>
        </div>
      </section>

      <section className="movies-section" id="cartelera">
        <div className="movie-section-heading">
          <div>
            <h2>En cartelera</h2>
            <p className="movie-count">
              {cargando ? "Cargando películas..." : `${peliculas.length} películas disponibles`}
            </p>
          </div>
          <label className="movie-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Buscar película..." aria-label="Buscar película" />
          </label>
        </div>

        {error && <p className="movie-state">Error: {error}</p>}
        {!cargando && !error && peliculas.length === 0 && (
          <p className="movie-state">No hay películas disponibles.</p>
        )}
        {peliculas.length > 0 && (
          <div className="listado">
            {peliculas.map((pelicula) => (
              <PeliculaCard key={pelicula.id} movie={pelicula} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Peliculas;
