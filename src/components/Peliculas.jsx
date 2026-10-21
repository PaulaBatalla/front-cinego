import { useEffect, useState } from "react";
import PeliculaCard from "./PeliculaCard";
import { solicitar } from "../services/api";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPeliculas = async () => {
      try {
        const datos = await solicitar("/peliculas");
        setPeliculas(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarPeliculas();
  }, []);

  if (cargando) return <p>Cargando películas...</p>;
  if (error) return <p>Error: {error}</p>;
  if (peliculas.length === 0) return <p>No hay películas disponibles.</p>;

  return (
    <div className="listado">
      {peliculas.map((pelicula) => (
        <PeliculaCard key={pelicula.id} movie={pelicula} />
      ))}
    </div>
  );
}

export default Peliculas;
