import { useEffect, useId, useRef, useState } from "react";
import { useRecordatorios } from "../../hooks/useRecordatorios";
import { BellIcon } from "../icons";
import "../../styles/Campanita.css";

function Campanita() {
  const { recordatorios, noLeidos, marcarLeidos, recargar } = useRecordatorios();
  const [abierta, setAbierta] = useState(false);
  const contenedor = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!abierta) return;

    const cerrar = () => {
      marcarLeidos();
      setAbierta(false);
    };
    const alHacerClic = (event) => {
      if (!contenedor.current.contains(event.target)) cerrar();
    };
    const alApretarTecla = (event) => {
      if (event.key === "Escape") cerrar();
    };

    document.addEventListener("mousedown", alHacerClic);
    document.addEventListener("keydown", alApretarTecla);

    return () => {
      document.removeEventListener("mousedown", alHacerClic);
      document.removeEventListener("keydown", alApretarTecla);
    };
  }, [abierta, marcarLeidos]);

  const alternar = () => {
    if (abierta) {
      marcarLeidos();
    } else {
      recargar();
    }
    setAbierta(!abierta);
  };

  const cantidad = recordatorios.length;
  const contador = abierta ? 0 : noLeidos;

  return (
    <div className="campanita" ref={contenedor}>
      <button
        type="button"
        className="campanita__boton"
        aria-label={contador > 0 ? `Recordatorios: ${contador} sin leer` : "Recordatorios"}
        aria-expanded={abierta}
        aria-controls={panelId}
        onClick={alternar}
      >
        <BellIcon />
        {contador > 0 && <span className="campanita__contador">{contador}</span>}
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
                <li
                  key={recordatorio.id}
                  className={`campanita__item${recordatorio.leido ? " campanita__item--leido" : ""}`}
                >
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
