import { useMemo } from "react";
import "./PeliculasFiltros.css";

function formatearFechaCorta(fecha) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = fecha
    .toLocaleDateString("es-AR", { month: "short" })
    .toUpperCase()
    .replace(".", "");
  return `${dia}/${mes}`;
}

function generarDiasCartelera() {
  const hoy = new Date();
  const dias = [
    { id: "todos", nombre: "TODOS", fecha: "todos", etiqueta: "Todos los días" },
    {
      id: "hoy",
      nombre: "HOY",
      fecha: hoy.toISOString().slice(0, 10),
      etiqueta: formatearFechaCorta(hoy),
    },
  ];

  for (let i = 1; i <= 5; i++) {
    const f = new Date(hoy);
    f.setDate(hoy.getDate() + i);
    const nombreDia = f
      .toLocaleDateString("es-AR", { weekday: "short" })
      .toUpperCase()
      .replace(".", "");
    dias.push({
      id: f.toISOString().slice(0, 10),
      nombre: nombreDia,
      etiqueta: formatearFechaCorta(f),
      fecha: f.toISOString().slice(0, 10),
    });
  }

  return dias;
}

function PeliculasFiltros({
  diaSeleccionado,
  onSeleccionarDia,
  idiomaSeleccionado,
  onSeleccionarIdioma,
  formatoSeleccionado,
  onSeleccionarFormato,
  onLimpiarFiltros,
  hayFiltrosActivos,
  totalResultados,
}) {
  const dias = useMemo(() => generarDiasCartelera(), []);

  return (
    <div className="peliculas-filtros" aria-label="Filtros de cartelera">
      {/* Fila 1: Segmentado de Días */}
      <div className="filtros-dias" role="tablist" aria-label="Seleccionar día de función">
        {dias.map((dia) => {
          const esActivo =
            dia.id === "todos"
              ? diaSeleccionado === "todos"
              : diaSeleccionado === dia.fecha ||
                (dia.id === "hoy" && diaSeleccionado === "hoy");

          return (
            <button
              key={dia.id}
              type="button"
              role="tab"
              aria-selected={esActivo}
              className={`filtro-dia-btn ${esActivo ? "activo" : ""}`}
              onClick={() => onSeleccionarDia(dia.id === "todos" ? "todos" : dia.fecha)}
            >
              <span className="filtro-dia-nombre">{dia.nombre}</span>
              {dia.id !== "todos" && (
                <span className="filtro-dia-fecha">{dia.etiqueta}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fila 2: Selectores de Formato e Idioma */}
      <div className="filtros-secundarios">
        <div className="filtros-selects">
          {/* Selector de Formatos */}
          <div className="filtro-select-group">
            <label htmlFor="filtro-formato" className="visually-hidden">
              Formato
            </label>
            <select
              id="filtro-formato"
              className="filtro-select"
              value={formatoSeleccionado}
              onChange={(e) => onSeleccionarFormato(e.target.value)}
            >
              <option value="todos">Formatos ▾</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="premium">Sala Premium</option>
            </select>
          </div>

          {/* Selector de Idioma (Sub o Castellano) */}
          <div className="filtro-select-group">
            <label htmlFor="filtro-idioma" className="visually-hidden">
              Idioma
            </label>
            <select
              id="filtro-idioma"
              className="filtro-select"
              value={idiomaSeleccionado}
              onChange={(e) => onSeleccionarIdioma(e.target.value)}
            >
              <option value="todos">Idioma ▾</option>
              <option value="sub">Subtitulada</option>
              <option value="castellano">Castellano (Doblada)</option>
            </select>
          </div>
        </div>

        {/* Resumen / Limpiar */}
        <div className="filtros-resumen">
          <span className="filtros-conteo">
            {totalResultados} {totalResultados === 1 ? "película" : "películas"}
          </span>

          {hayFiltrosActivos && (
            <button
              type="button"
              className="filtro-limpiar-btn"
              onClick={onLimpiarFiltros}
              title="Restablecer todos los filtros"
            >
              Limpiar filtros ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PeliculasFiltros;
