import { useState } from "react";
import PeliculaFila from "../components/admin/peliculas/PeliculaFila";
import { PlusIcon, SearchIcon } from "../components/icons";
import { useAdminPeliculas } from "../hooks/useAdminPeliculas";
import { normalizarBusquedaRegex } from "../utils/busquedaRegex";

function AdminPeliculas() {
  const { peliculas, cargando, error, reintentar } = useAdminPeliculas();
  const [busqueda, setBusqueda] = useState("");

  const regex = busqueda.trim() ? normalizarBusquedaRegex(busqueda) : null;
  const peliculasFiltradas = regex
    ? peliculas.filter((pelicula) => pelicula.titulo && regex.test(pelicula.titulo))
    : peliculas;

  const cantidadTexto = `${peliculas.length} ${
    peliculas.length === 1 ? "película en cartelera" : "películas en cartelera"
  }`;

  const renderContenido = () => {
    if (cargando) {
      return (
        <p className="admin-estado" role="status">
          Cargando películas...
        </p>
      );
    }

    if (error) {
      return (
        <div className="admin-vacio" role="alert">
          <span className="admin-vacio__texto">{error}</span>
          <button className="admin-boton-ghost" type="button" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      );
    }

    if (peliculasFiltradas.length === 0) {
      return (
        <div className="admin-vacio">
          <span className="admin-vacio__texto">
            {peliculas.length
              ? "No encontramos películas con ese nombre."
              : "Todavía no hay películas. Agregá la primera."}
          </span>
          <button className="admin-boton-cta admin-boton-cta--chico" type="button">
            Agregar película
          </button>
        </div>
      );
    }

    return (
      <ul className="admin-lista">
        {peliculasFiltradas.map((pelicula) => (
          <PeliculaFila key={pelicula.id} pelicula={pelicula} />
        ))}
      </ul>
    );
  };

  return (
    <section className="admin-seccion" aria-labelledby="admin-peliculas-titulo">
      <div className="admin-seccion__encabezado">
        <div className="admin-seccion__copy">
          <h1 id="admin-peliculas-titulo" className="admin-titulo">
            Películas
          </h1>
          {!cargando && !error && (
            <span className="admin-seccion__subtitulo">{cantidadTexto}</span>
          )}
        </div>

        <div className="admin-seccion__acciones">
          <label className="admin-buscador">
            <SearchIcon className="admin-buscador__icono" />
            <span className="visually-hidden">Buscar película</span>
            <input
              type="search"
              placeholder="Buscar…"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>
          <button className="admin-boton-cta" type="button">
            <PlusIcon />
            Agregar película
          </button>
        </div>
      </div>

      {renderContenido()}
    </section>
  );
}

export default AdminPeliculas;
