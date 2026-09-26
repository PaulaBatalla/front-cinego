import PeliculaCard from "./PeliculaCard";
import productos from "../data/peliculas.json";

function Listado() {
  return (
    <div className="listado">
      {productos.map((pelicula) => (
        <PeliculaCard
          key={pelicula.id}
          titulo={pelicula.titulo}
          descripcion={pelicula.descripcion}
          precio={pelicula.precio}
          imagen={pelicula.imagen}
        />
      ))}
    </div>
  );
}

export default Listado;