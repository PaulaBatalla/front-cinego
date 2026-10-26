import { useEffect, useState } from "react";
import "../styles/Peliculas.css";
import PeliculasFallback from "./PeliculasFallback";
import PeliculasList from "./PeliculasList";
import { SearchIcon } from "./icons";
import { solicitar } from "../services/api";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

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

  if (cargando) return <p className="listado-status">Cargando películas...</p>;
  if (error) return <p className="listado-status">Error: {error}</p>;

  return (
    <div className="listado-container">
      <section className="listado-header">
        <div className="listado-header__copy">
          <h1 className="listado-header__title">En cartelera</h1>
          <p className="listado-header__subtitle">
            {peliculas.length} películas disponibles
          </p>
        </div>

        <label className="listado-search">
          <SearchIcon />
          <span className="visually-hidden">Buscar película</span>
          <input
            type="search"
            placeholder="Buscar película..."
            className="listado-search__input"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </label>
      </section>

      <PeliculasList
        fallback={<PeliculasFallback />}
        peliculas={peliculas}
        busqueda={busqueda}
      />
    </div>
  );
}

export default Peliculas;
