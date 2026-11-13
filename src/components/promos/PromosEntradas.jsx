import { useEffect, useState } from "react";
import "../../styles/Promos.css";
import { descuentoService } from "../../services/descuentoService";
import { formatearPorcentaje, textoAplica } from "../../utils/promos";

// Promos activas en el home. Si no hay, o no se pudieron cargar, la sección no se muestra:
// es un extra de la cartelera y no tiene que molestar si falla.
function PromosEntradas() {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    const controlador = new AbortController();

    descuentoService
      .listar(controlador.signal)
      .then((datos) => setPromos((datos ?? []).filter((promo) => promo.activo)))
      .catch(() => {
        if (!controlador.signal.aborted) setPromos([]);
      });

    return () => controlador.abort();
  }, []);

  if (promos.length === 0) {
    return null;
  }

  return (
    <section className="promos" aria-labelledby="promos-titulo">
      <div className="promos__copy">
        <h2 id="promos-titulo" className="promos__titulo">
          Promos en entradas
        </h2>
        <p className="promos__subtitulo">Se aplican solas al elegir la función.</p>
      </div>

      <ul className="promos__grilla">
        {promos.map((promo) => (
          <li key={promo.id} className="promo-tarjeta">
            <span className="promo-tarjeta__porcentaje">
              {formatearPorcentaje(promo.porcentaje)}
            </span>
            <div className="promo-tarjeta__textos">
              <span className="promo-tarjeta__nombre">{promo.nombre}</span>
              <span className="promo-tarjeta__aplica">{textoAplica(promo)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PromosEntradas;
