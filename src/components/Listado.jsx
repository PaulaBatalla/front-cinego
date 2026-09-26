import PeliculaCard from "./PeliculaCard";
import productos from "../data/products.json";
import peli1 from "../assets/peli1.jpg";
import peli2 from "../assets/peli2.jpg";
import peli3 from "../assets/peli3.jpg";
import peli4 from "../assets/peli4.jpg";

const imagenesPorId = {
  1: peli1,
  2: peli2,
  3: peli3,
  4: peli4,
};

function Listado() {
  return (
    <div className="listado">
      {productos.map((pelicula) => (
        <PeliculaCard
          key={pelicula.id}
          titulo={pelicula.titulo}
          descripcion={pelicula.descripcion}
          precio={pelicula.precio}
          imagen={imagenesPorId[pelicula.id]}
        />
      ))}
    </div>
  );
}

export default Listado;