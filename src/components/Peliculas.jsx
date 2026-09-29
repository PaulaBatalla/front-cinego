import PeliculaCard from "./PeliculaCard";
import {usePeliculas} from "../hooks/usePeliculas";

function Peliculas() {
  const { peliculas } = usePeliculas();
  return (
    <div className="listado">
      {peliculas.map((pelicula) => (
        <PeliculaCard key={pelicula.id} movie={pelicula} />
      ))}
    </div>
  );
}

export default Peliculas;