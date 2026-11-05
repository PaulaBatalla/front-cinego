import { EditIcon, TrashIcon } from "../../icons";
import { aMinutos, etiquetaDia, formatearMinutos, formatearPrecio } from "../../../utils/fechas";
import PosterMiniatura from "../peliculas/PosterMiniatura";

function FuncionFila({ funcion, pelicula, sala, onEditar, onEliminar }) {
  const titulo = pelicula?.titulo ?? funcion.peliculaTitulo;
  const nombreSala = sala?.nombre ?? funcion.salaNombre;
  const fin = pelicula ? formatearMinutos(aMinutos(funcion.hora) + pelicula.duracion) : null;
  const descripcion = `${titulo} · ${etiquetaDia(funcion.fecha)} ${funcion.hora}`;

  return (
    <li className="admin-fila admin-fila--funcion">
      <div className="admin-funcion__horario">
        <span className="admin-funcion__hora">{funcion.hora}</span>
        {fin && <span className="admin-funcion__fin">hasta {fin}</span>}
      </div>

      <PosterMiniatura
        pelicula={pelicula ?? { id: funcion.peliculaId, titulo }}
        className="admin-funcion__poster"
      />

      <div className="admin-fila__datos admin-funcion__datos">
        <span className="admin-funcion__titulo">{titulo}</span>
        <span className="admin-funcion__sala">
          {nombreSala}
          {sala && ` · ${sala.cantidadAsientos} asientos`}
        </span>
      </div>

      <span className="admin-funcion__precio">{formatearPrecio(funcion.precio)}</span>

      <div className="admin-fila__acciones">
        <button
          className="admin-boton-fila"
          type="button"
          aria-label={`Editar ${descripcion}`}
          onClick={() => onEditar?.(funcion)}
        >
          <EditIcon />
          Editar
        </button>
        <button
          className="admin-boton-fila admin-boton-fila--peligro"
          type="button"
          aria-label={`Eliminar ${descripcion}`}
          onClick={() => onEliminar?.(funcion)}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

export default FuncionFila;
