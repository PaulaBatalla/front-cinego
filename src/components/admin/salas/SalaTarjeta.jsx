import { EditIcon, TrashIcon } from "../../icons";
import MapaAsientos from "./MapaAsientos";

function SalaTarjeta({ sala, cantidadFunciones, onEditar, onEliminar }) {
  return (
    <li className="admin-sala">
      <div className="admin-sala__cabecera">
        <h2 className="admin-sala__nombre">{sala.nombre}</h2>
        <span className="admin-sala__funciones">
          {cantidadFunciones === 1 ? "1 función" : `${cantidadFunciones} funciones`}
        </span>
      </div>

      <MapaAsientos filas={sala.filas} asientosPorFila={sala.asientosPorFila} />

      <div className="admin-sala__total">
        <span className="admin-sala__numero">{sala.cantidadAsientos}</span>
        <span className="admin-sala__detalle">
          asientos · {sala.filas} {sala.filas === 1 ? "fila" : "filas"} de {sala.asientosPorFila}
        </span>
      </div>

      <div className="admin-sala__acciones">
        <button
          className="admin-boton-fila admin-sala__editar"
          type="button"
          aria-label={`Editar ${sala.nombre}`}
          onClick={() => onEditar(sala)}
        >
          <EditIcon />
          Editar
        </button>
        <button
          className="admin-boton-fila admin-boton-fila--peligro"
          type="button"
          aria-label={`Eliminar ${sala.nombre}`}
          onClick={() => onEliminar(sala)}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

export default SalaTarjeta;
