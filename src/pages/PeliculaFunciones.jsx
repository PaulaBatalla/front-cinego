import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResumenFuncion from "../components/funciones/ResumenFuncion";
import SalaHorarios from "../components/funciones/SalaHorarios";
import SelectorDia from "../components/funciones/SelectorDia";
import todasLasFunciones from "../data/funciones.json";
import { usePeliculas } from "../hooks/usePeliculas";
import "./PeliculaFunciones.css";

// Página /pelicula/:id → se llega desde "Ver funciones" en la cartelera.
function PeliculaFunciones() {
  const { id } = useParams();
  const { peliculas } = usePeliculas();
  const pelicula = peliculas.find((p) => p.id === Number(id));

  if (!pelicula) {
    return (
      <main className="funciones-pagina">
        <p>No encontramos esa película.</p>
        <Link to="/">Volver a la cartelera</Link>
      </main>
    );
  }

  // key: si se pasa de una película a otra, el selector arranca de cero.
  return <SeleccionFuncion key={pelicula.id} pelicula={pelicula} />;
}

function SeleccionFuncion({ pelicula }) {
  // Solo las funciones de esta película, ordenadas por día y hora.
  const funciones = todasLasFunciones
    .filter((f) => f.peliculaId === pelicula.id)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  // Los días que tienen funciones, sin repetir.
  const dias = funciones.map((f) => f.fecha).filter((fecha, i, lista) => lista.indexOf(fecha) === i);

  const [diaElegido, setDiaElegido] = useState(dias.length > 0 ? dias[0] : null);
  const [funcionElegida, setFuncionElegida] = useState(null);

  // Las funciones del día elegido, agrupadas por sala.
  const funcionesDelDia = funciones.filter((f) => f.fecha === diaElegido);
  const salas = funcionesDelDia.map((f) => f.sala).filter((sala, i, lista) => lista.indexOf(sala) === i);

  function elegirDia(dia) {
    setDiaElegido(dia);
    setFuncionElegida(null); // al cambiar de día, se borra el horario elegido
  }

  return (
    <main className="funciones-pagina">
      <Link className="volver" to="/">
        ← Volver a la cartelera
      </Link>

      <section className="pelicula-detalle">
        <img className="pelicula-detalle-poster" src={pelicula.posterUrl} alt={`Póster de ${pelicula.titulo}`} />
        <div>
          <h1>{pelicula.titulo}</h1>
          <div className="etiquetas">
            <span className="etiqueta" title="Clasificación por edad">
              +{pelicula.clasificacion}
            </span>
            <span className="etiqueta">{pelicula.duracion}</span>
          </div>
          <h2 className="selector-titulo">Sinopsis</h2>
          <p className="sinopsis">{pelicula.sinopsis}</p>
        </div>
      </section>

      <div className="funciones-layout">
        <section className="funciones-selector">
          {dias.length === 0 ? (
            <p className="sin-funciones">Por ahora no hay funciones programadas para esta película.</p>
          ) : (
            <>
              <SelectorDia dias={dias} diaElegido={diaElegido} onElegir={elegirDia} />

              <div className="selector-bloque">
                <h3 className="selector-titulo">Sala y horario</h3>
                {salas.map((sala) => {
                  const funcionesDeLaSala = funcionesDelDia.filter((f) => f.sala === sala);
                  return (
                    <SalaHorarios
                      key={sala}
                      sala={sala}
                      formato={funcionesDeLaSala[0].formato}
                      precio={funcionesDeLaSala[0].precio}
                      funciones={funcionesDeLaSala}
                      funcionElegida={funcionElegida}
                      onElegir={setFuncionElegida}
                    />
                  );
                })}
              </div>
            </>
          )}
        </section>

        <ResumenFuncion titulo={pelicula.titulo} funcion={funcionElegida}>
          <button type="button" className="boton-continuar" disabled={funcionElegida === null}>
            {funcionElegida ? "Elegir asientos" : "Elegí un horario"}
          </button>
        </ResumenFuncion>
      </div>
    </main>
  );
}

export default PeliculaFunciones;
