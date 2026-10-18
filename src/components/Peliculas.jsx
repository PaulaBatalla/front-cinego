import { useEffect, useState } from "react";
import PeliculaCard from "./PeliculaCard";
import { solicitar } from "../services/api";
import peliculasLocales from "../data/peliculas.json";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPeliculas = async () => {
      try {
        const datos = await solicitar("/peliculas");
        setPeliculas(datos);
      } catch (err) {
        console.warn("Backend no disponible, cargando películas locales de respaldo:", err);
        const adaptadas = peliculasLocales.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          sinopsis: p.descripcion,
          duracion: "120 min",
          clasificacion: 13,
          posterUrl: p.imagen,
        }));
        setPeliculas(adaptadas);
      } finally {
        setCargando(false);
      }
    };

    cargarPeliculas();
  }, []);

  if (cargando) return <p>Cargando películas...</p>;
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
