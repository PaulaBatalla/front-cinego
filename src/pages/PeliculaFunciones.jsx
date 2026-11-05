import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ResumenFuncion from "../components/funciones/ResumenFuncion";
import SalaHorarios from "../components/funciones/SalaHorarios";
import SelectorDia from "../components/funciones/SelectorDia";
import ReservaFuncion from "../components/ReservaFuncion";
import "./PeliculaFunciones.css";
import { usePeliculasQuery, useFuncionesQuery } from "../services/reservasApi";
import { useAuth } from "../hooks/useAuth";
function adaptarFuncion(f) {
  return {
    id: f.id,
    peliculaId: f.peliculaId,
    fecha: f.horarioInicio.slice(0, 10),
    hora: f.horarioInicio.slice(11, 16),
    sala: f.salaNombre,
    precio: Number(f.precio),
  };
}

// Página /pelicula/:id → se llega desde "Ver funciones" en la cartelera.
function PeliculaFunciones() {
  const { id } = useParams();
  const peliculas = usePeliculasQuery();
  const funciones = useFuncionesQuery();
  const error = peliculas.error || funciones.error;
  const pelicula = peliculas.data?.find((p) => String(p.id) === id);
  if (error) return <main className="funciones-pagina"><p role="alert">{error.message}</p><button onClick={() => { peliculas.refetch(); funciones.refetch(); }}>Reintentar</button></main>;
  if (!peliculas.data || !funciones.data) return <p role="status">Cargando funciones...</p>;

  if (!pelicula) {
    return (
      <main className="funciones-pagina">
        <p>No encontramos esa película.</p>
        <Link to="/">Volver a la cartelera</Link>
      </main>
    );
  }

  // key: si se pasa de una película a otra, el selector arranca de cero.
  return <SeleccionFuncion key={pelicula.id} pelicula={pelicula} funciones={funciones.data.filter((f) => String(f.peliculaId) === id).map(adaptarFuncion)} />;
}

function SeleccionFuncion({ pelicula, funciones }) {
  const [params, setParams] = useSearchParams();
  const { token } = useAuth();
  // Ordenadas por día y hora.
  const ordenadas = [...funciones].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  // Los días que tienen funciones, sin repetir.
  const dias = ordenadas.map((f) => f.fecha).filter((fecha, i, lista) => lista.indexOf(fecha) === i);

  const funcionElegida = ordenadas.find((f) => String(f.id) === params.get("funcionId")) ?? null;
  const [dia, setDia] = useState(dias[0] ?? null);
  const diaElegido = funcionElegida?.fecha ?? dia;
  const [asientosElegidos, setAsientosElegidos] = useState([]);

  function elegirFuncion(funcion) {
    if (funcion?.id === funcionElegida?.id) return;
    setParams(funcion ? { funcionId: funcion.id } : {});
    setAsientosElegidos([]);
  }

  // Las funciones del día elegido, agrupadas por sala.
  const funcionesDelDia = ordenadas.filter((f) => f.fecha === diaElegido);
  const salas = funcionesDelDia.map((f) => f.sala).filter((sala, i, lista) => lista.indexOf(sala) === i);

  function elegirDia(dia) {
    setDia(dia);
    setParams({}); // al cambiar de día, se borra el horario elegido
    setAsientosElegidos([]);
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
                      precio={funcionesDeLaSala[0].precio}
                      funciones={funcionesDeLaSala}
                      funcionElegida={funcionElegida}
                      onElegir={elegirFuncion}
                    />
                  );
                })}
              </div>
              {funcionElegida && <ReservaFuncion key={`${token}-${funcionElegida.id}`} funcion={funcionElegida} titulo={pelicula.titulo} onResumen={setAsientosElegidos} />}
            </>
          )}
        </section>

        <ResumenFuncion titulo={pelicula.titulo} funcion={funcionElegida}>
          <dl>
            <div><dt>Asientos</dt><dd>{asientosElegidos.join(", ") || "Sin elegir"}</dd></div>
            <div aria-live="polite"><dt>Total</dt><dd>${((funcionElegida?.precio ?? 0) * asientosElegidos.length).toLocaleString("es-AR")}</dd></div>
          </dl>
          {!funcionElegida && <p>Elegí un horario para ver los asientos.</p>}
        </ResumenFuncion>
      </div>
    </main>
  );
}

export default PeliculaFunciones;
