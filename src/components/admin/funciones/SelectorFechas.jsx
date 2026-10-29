import { CloseIcon } from "../../icons";
import { etiquetaDia, hoyIso } from "../../../utils/fechas";

// Varias fechas como chips: cada fecha que se elige en el calendario se suma a la lista
function SelectorFechas({ fechas, onCambiar }) {
  const ordenadas = [...fechas].sort();

  const sumar = (fecha) => {
    if (fecha && !fechas.includes(fecha)) onCambiar([...fechas, fecha]);
  };

  return (
    <>
      <input
        className="admin-input"
        type="date"
        aria-label="Sumar una fecha"
        min={hoyIso()}
        value=""
        onChange={(event) => sumar(event.target.value)}
      />
      <span className="admin-campo__ayuda">
        Elegí una fecha y se suma a la lista. Podés sumar todas las que quieras.
      </span>
      {ordenadas.length > 0 && (
        <ul className="admin-fechas-form__chips">
          {ordenadas.map((fecha) => (
            <li key={fecha} className="admin-fecha-chip">
              {etiquetaDia(fecha)}
              <button
                className="admin-fecha-chip__quitar"
                type="button"
                aria-label={`Quitar ${etiquetaDia(fecha)}`}
                onClick={() => onCambiar(fechas.filter((f) => f !== fecha))}
              >
                <CloseIcon className="admin-fecha-chip__icono" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default SelectorFechas;
