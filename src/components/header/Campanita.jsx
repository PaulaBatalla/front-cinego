import { useEffect, useId, useRef, useState } from "react";
import { useRecordatorios } from "../../hooks/useRecordatorios";
import { BellIcon } from "../icons";
import "../../styles/Campanita.css";

function Campanita() {
  const { recordatorios, recargar } = useRecordatorios();
  const [abierta, setAbierta] = useState(false);
  const contenedor = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!abierta) return;

    const alHacerClic = (event) => {
      if (!contenedor.current.contains(event.target)) setAbierta(false);
    };
    const alApretarTecla = (event) => {
      if (event.key === "Escape") setAbierta(false);
    };

    document.addEventListener("mousedown", alHacerClic);
    document.addEventListener("keydown", alApretarTecla);

    return () => {
      document.removeEventListener("mousedown", alHacerClic);
      document.removeEventListener("keydown", alApretarTecla);
    };
  }, [abierta]);

  const alternar = () => {
    if (!abierta) recargar();
    setAbierta(!abierta);
  };

  const cantidad = recordatorios.length;

  return (
    <div className="campanita" ref={contenedor}>
      <button
        type="button"
        className="campanita__boton"
        aria-label={cantidad > 0 ? `Recordatorios: ${cantidad}` : "Recordatorios"}
        aria-expanded={abierta}
        aria-controls={panelId}
        onClick={alternar}
      >
        <BellIcon />
        {cantidad > 0 && <span className="campanita__contador">{cantidad}</span>}
      </button>

      {abierta && (
        <div id={panelId} className="campanita__panel">
          <p className="campanita__titulo">Próximas funciones</p>

          {cantidad === 0 ? (
            <p className="campanita__vacio">
              No tenés funciones en las próximas 48 horas
            </p>
          ) : (
            <ul className="campanita__lista">
              {recordatorios.map((recordatorio) => (
                <li key={recordatorio.id} className="campanita__item">
                  <p className="campanita__cuando">{recordatorio.cuando}</p>
                  <p className="campanita__pelicula">{recordatorio.titulo}</p>
                  <p className="campanita__detalle">
                    {recordatorio.sala} · Asientos {recordatorio.asientos.join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Campanita;
