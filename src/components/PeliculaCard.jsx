import { Link } from "react-router-dom";
import CustomCard from "./CustomCard";

function PeliculaCard({ movie }) {
  const idiomas = movie.idiomas || ["sub", "castellano"];
  const formatos = movie.formatos || ["2D"];

  return (
    <CustomCard
      image={movie.posterUrl}
      imageAlt={`Póster de ${movie.titulo}`}
      badge={`+${movie.clasificacion}`}
      badgeTitle="Clasificación por edad"
      title={movie.titulo}
      description={movie.sinopsis}
      duration={movie.duracion}
    >
      <div className="movie-tags-list" aria-label="Formatos e idiomas disponibles">
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
