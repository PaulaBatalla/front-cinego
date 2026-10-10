
// Botones con los días que tienen funciones. El elegido se marca distinto.
function SelectorDia({ dias, diaElegido, onElegir }) {
  return (
    <div className="selector-bloque">
      <h3 className="selector-titulo">Día</h3>
      <div className="dias">
        {dias.map((dia) => (
          <button
            key={dia}
            type="button"
            className={dia === diaElegido ? "dia dia-activo" : "dia"}
            aria-pressed={dia === diaElegido}
            onClick={() => onElegir(dia)}
          >
            <span className="dia-nombre">{dia}</span>
            <strong>{dia}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectorDia;
