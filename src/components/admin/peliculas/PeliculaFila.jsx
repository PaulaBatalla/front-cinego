import { EditIcon, StarIcon, TrashIcon } from "../../icons";
import { formatearDuracion, formatearPuntaje } from "../../../utils/peliculas";
import PosterMiniatura from "./PosterMiniatura";

function PeliculaFila({ pelicula, onEditar, onEliminar }) {
  return (
    <li className="admin-fila">
      <PosterMiniatura pelicula={pelicula} className="admin-fila__poster" />

      <div className="admin-fila__datos">
        <span className="admin-fila__titulo">{pelicula.titulo}</span>
        <span className="admin-fila__meta">
          <span>{formatearDuracion(pelicula.duracion)}</span>
          <span aria-hidden="true">·</span>
          <span className="admin-fila__puntaje">
            <StarIcon />
            <span className="visually-hidden">Puntaje</span>
            {formatearPuntaje(pelicula.clasificacion)}
          </span>
        </span>
      </div>

      {pelicula.sinopsis && (
        <p className="admin-fila__sinopsis admin-ocultar-sm">{pelicula.sinopsis}</p>
      )}

      <div className="admin-fila__acciones">
        <button
          className="admin-boton-fila"
          type="button"
          aria-label={`Editar ${pelicula.titulo}`}
          onClick={() => onEditar?.(pelicula)}
        >
          <EditIcon />
          Editar
        </button>
        <button
          className="admin-boton-fila admin-boton-fila--peligro"
          type="button"
          aria-label={`Eliminar ${pelicula.titulo}`}
          onClick={() => onEliminar?.(pelicula)}
        >
          <TrashIcon />
          <span className="admin-ocultar-sm">Eliminar</span>
        </button>
      </div>
    </li>
  );
}

export default PeliculaFila;
