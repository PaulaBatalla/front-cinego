import { useEffect, useState } from "react";
import PeliculaCard from "./PeliculaCard";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPeliculas = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Falta iniciar sesión para consultar las películas");
        }

        const respuesta = await fetch(
          "http://localhost:8080/api/peliculas",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            `Error al cargar las películas (${respuesta.status})`
          );
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