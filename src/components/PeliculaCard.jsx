import { Link } from "react-router-dom";
import { formatearClasificacion } from "../utils/peliculas";
import CustomCard from "./CustomCard";

function PeliculaCard({ movie }) {
  const idiomas = movie.idiomas || ["sub", "castellano"];
  const formatos = movie.formatos || ["2D"];
  const generos = movie.genero
    ? movie.genero.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  return (
    <CustomCard
      image={movie.posterUrl}
      imageAlt={`Póster de ${movie.titulo}`}
      badge={formatearClasificacion(movie.clasificacion)}
      badgeTitle="Clasificación por edad"
      title={movie.titulo}
      description={movie.sinopsis}
      duration={movie.duracion}
    >
      <div className="movie-tags-list" aria-label="Géneros, formatos e idiomas disponibles">
        {generos.map((genero) => (
          <span key={genero} className="movie-tag genero">
            {genero}
          </span>
        ))}
        {formatos.map((fmt) => (
          <span
            key={fmt}
            className={`movie-tag ${fmt === "3D" || fmt === "premium" ? "highlight" : ""}`}
          >
            {fmt === "premium" ? "PREMIUM" : fmt.toUpperCase()}
          </span>
        ))}
        {idiomas.includes("sub") && <span className="movie-tag">SUB</span>}
        {idiomas.includes("castellano") && <span className="movie-tag">DOB</span>}
      </div>

      <Link className="boton-ver-funciones" to={`/pelicula/${movie.id}`}>
        Ver funciones
      </Link>
    </CustomCard>
  );
}

export default PeliculaCard;
