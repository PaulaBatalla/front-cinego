import { CalendarIcon, CopyIcon, TrashIcon } from "../../icons";
import { fechaLarga } from "../../../utils/fechas";

// Resumen del día elegido, filtro por película y acciones sobre todas sus funciones
function BarraDia({
  dia,
  cantidad,
  peliculas,
  peliculaFiltro,
  onFiltrar,
  onCopiar,
  onMover,
  onEliminar,
}) {
  return (
    <div className="admin-barra-dia">
      <div className="admin-barra-dia__copy">
        <span className="admin-barra-dia__fecha">{fechaLarga(dia)}</span>
        <span className="admin-barra-dia__resumen">
          {cantidad ? `${cantidad} ${cantidad === 1 ? "función" : "funciones"}` : "Sin funciones"}
        </span>
      </div>

      <div className="admin-barra-dia__acciones">
        <label className="admin-barra-dia__filtro">
          <span className="visually-hidden">Filtrar por película</span>
          <select
            className="admin-input admin-input--select"
            value={peliculaFiltro}
            onChange={(event) => onFiltrar(event.target.value)}
          >
            <option value="todas">Todas las películas</option>
            {peliculas.map((pelicula) => (
              <option key={pelicula.id} value={pelicula.id}>
                {pelicula.titulo}
              </option>
            ))}
          </select>
        </label>

        {cantidad > 0 && (
          <>
            <button className="admin-boton-fila" type="button" onClick={onCopiar}>
              <CopyIcon />
              Copiar día
            </button>
            <button className="admin-boton-fila" type="button" onClick={onMover}>
              <CalendarIcon />
              Cambiar fecha
            </button>
            <button
              className="admin-boton-fila admin-boton-fila--peligro"
              type="button"
              aria-label="Eliminar todas las funciones de este día"
              onClick={onEliminar}
            >
              <TrashIcon />
              <span className="admin-ocultar-sm">Eliminar día</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default BarraDia;
