import { etiquetaDia } from "../../../utils/fechas";

// Chips con los días que tienen funciones (cada uno con su cantidad) y "Otra fecha" para ir a cualquier día
function TiraFechas({ dias, diaElegido, onElegir }) {
  return (
    <div className="admin-fechas" role="group" aria-label="Fecha">
      {dias.map(({ fecha, cantidad }) => (
        <button
          key={fecha}
          type="button"
          className={`admin-chip${fecha === diaElegido ? " is-activo" : ""}`}
          aria-pressed={fecha === diaElegido}
          onClick={() => onElegir(fecha)}
        >
          {etiquetaDia(fecha)} <span className="admin-chip__cantidad">· {cantidad}</span>
        </button>
      ))}

      <label className="admin-fechas__otra">
        Otra fecha
        <input
          className="admin-input admin-fechas__input"
          type="date"
          value={diaElegido}
          onChange={(event) => {
            if (event.target.value) onElegir(event.target.value);
          }}
        />
      </label>
    </div>
  );
}

export default TiraFechas;
