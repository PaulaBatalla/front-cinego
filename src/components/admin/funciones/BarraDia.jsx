import { fechaLarga } from "../../../utils/fechas";

// Resumen del día elegido y filtro por película
function BarraDia({ dia, cantidad, peliculas, peliculaFiltro, onFiltrar }) {
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
      </div>
    </div>
  );
}

export default BarraDia;
