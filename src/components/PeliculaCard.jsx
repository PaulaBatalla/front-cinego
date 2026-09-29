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
    />
  );
}

export default PeliculaCard;