import { useState } from "react";
import ConfirmarEliminar from "../components/admin/ConfirmarEliminar";
import PeliculaFila from "../components/admin/peliculas/PeliculaFila";
import PeliculaFormModal from "../components/admin/peliculas/PeliculaFormModal";
import { PlusIcon, SearchIcon } from "../components/icons";
import { useAdminPeliculas } from "../hooks/useAdminPeliculas";
import { normalizarBusquedaRegex } from "../utils/busquedaRegex";

function AdminPeliculas() {
  const { peliculas, cargando, error, reintentar, funcionesDe, guardar, eliminar } =
    useAdminPeliculas();
  const [busqueda, setBusqueda] = useState("");
  // null: cerrado · { pelicula: null }: nueva · { pelicula }: edición
  const [editor, setEditor] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const regex = busqueda.trim() ? normalizarBusquedaRegex(busqueda) : null;
  const peliculasFiltradas = regex
    ? peliculas.filter((pelicula) => pelicula.titulo && regex.test(pelicula.titulo))
    : peliculas;

  const cantidadTexto = `${peliculas.length} ${
    peliculas.length === 1 ? "película en cartelera" : "películas en cartelera"
  }`;

  const abrirNueva = () => setEditor({ pelicula: null });

  const handleGuardar = async (datos) => {
    const esNueva = !editor.pelicula;
    await guardar(datos, editor.pelicula?.id);
    setEditor(null);
    // Si había una búsqueda, la limpia para que se vea la película recién agregada
    if (esNueva) setBusqueda("");
  };

  const handleConfirmarEliminar = () => {
    eliminar(aEliminar);
    setAEliminar(null);
  };

  const textoEliminar = (pelicula) => {
    const cantidad = funcionesDe(pelicula.id);
    return cantidad
      ? `La película deja de aparecer en la cartelera y se eliminan sus ${cantidad} ${
          cantidad === 1 ? "función programada" : "funciones programadas"
        }.`
      : "La película deja de aparecer en la cartelera.";
  };

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
          <button
            className="admin-boton-cta admin-boton-cta--chico"
            type="button"
            onClick={abrirNueva}
          >
            Agregar película
          </button>
        </div>
      );
    }

    return (
      <ul className="admin-lista">
        {peliculasFiltradas.map((pelicula) => (
          <PeliculaFila
            key={pelicula.id}
            pelicula={pelicula}
            onEditar={(seleccionada) => setEditor({ pelicula: seleccionada })}
            onEliminar={setAEliminar}
          />
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
          <button className="admin-boton-cta" type="button" onClick={abrirNueva}>
            <PlusIcon />
            Agregar película
          </button>
        </div>
      </div>

      {renderContenido()}

      {editor && (
        <PeliculaFormModal
          pelicula={editor.pelicula}
          idColor={editor.pelicula?.id ?? peliculas.length}
          onGuardar={handleGuardar}
          onCerrar={() => setEditor(null)}
        />
      )}

      {aEliminar && (
        <ConfirmarEliminar
          titulo={`¿Eliminar “${aEliminar.titulo}”?`}
          texto={textoEliminar(aEliminar)}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </section>
  );
}

export default AdminPeliculas;
