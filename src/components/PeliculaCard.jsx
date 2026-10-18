import { Link } from "react-router-dom";
import CustomCard from "./CustomCard";

function PeliculaCard({ movie }) {
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
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px", flexWrap: "wrap" }}>
        <Link className="boton-ver-funciones" to={`/pelicula/${movie.id}`}>
          Ver funciones
        </Link>
        <Link className="btn-detalle" to={`/detalle/${movie.id}`}>
          Ver detalle
        </Link>
      </div>
    </CustomCard>
  );
}

export default PeliculaCard;
