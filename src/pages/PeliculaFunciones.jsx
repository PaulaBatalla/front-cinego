import { useFuncionesDisponibles } from "../hooks/useFuncionesDisponibles";
import { useState } from "react";
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom";
import SalaHorarios from "../components/funciones/SalaHorarios";
import SelectorDia from "../components/funciones/SelectorDia";
import ReservaFuncion from "../components/ReservaFuncion";
import "./PeliculaFunciones.css";
import { usePeliculaQuery, useFuncionesQuery } from "../services/reservasApi";
import { useAuth } from "../hooks/useAuth";
function adaptarFuncion(f) {
  return {
    id: f.id,
    horarioInicio: f.horarioInicio,
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
  const consultaPelicula = usePeliculaQuery(id);
  const funciones = useFuncionesQuery();
  // currentData pertenece al ID actual; data puede conservar el resultado anterior.
  const pelicula = consultaPelicula.currentData;
  const error = consultaPelicula.error?.status === 404 ? null : consultaPelicula.error || funciones.error;
  if (error) return <main className="funciones-pagina"><p role="alert">{error.message}</p><button onClick={() => { consultaPelicula.refetch(); funciones.refetch(); }}>Reintentar</button></main>;
  if (consultaPelicula.error?.status !== 404 && (!pelicula || !funciones.data)) return <p role="status">Cargando funciones...</p>;

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
  const location = useLocation();
  // Ordenadas por día y hora.
  const disponibles = useFuncionesDisponibles(funciones);
  const ordenadas = [...disponibles].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  // Los días que tienen funciones, sin repetir.
  const dias = ordenadas.map((f) => f.fecha).filter((fecha, i, lista) => lista.indexOf(fecha) === i);

  const funcionElegida = funciones.find((f) => String(f.id) === params.get("funcionId")) ?? null;
  const [dia, setDia] = useState(dias[0] ?? null);
  const diaElegido = funcionElegida && dias.includes(funcionElegida.fecha) ? funcionElegida.fecha : dias.includes(dia) ? dia : dias[0];
  const claveSeleccion = `${token}-${location.key}-${funcionElegida?.id}`;
  function elegirFuncion(funcion) {
    if (funcion?.id === funcionElegida?.id) return;
    setParams(funcion ? { funcionId: funcion.id } : {});
  }

  // Las funciones del día elegido, agrupadas por sala.
  const funcionesDelDia = ordenadas.filter((f) => f.fecha === diaElegido);
  const salas = funcionesDelDia.map((f) => f.sala).filter((sala, i, lista) => lista.indexOf(sala) === i);

  function elegirDia(dia) {
    setDia(dia);
    setParams({}); // al cambiar de día, se borra el horario elegido
  }

  return (
    <main className="funciones-pagina">
      <Link className="volver" to="/">
        ← Volver a la cartelera
      </Link>

      {params.get("funcionId") && !funcionElegida && <p role="status">La función elegida ya no está disponible. Elegí otro horario.</p>}
      <ReservaFuncion key={claveSeleccion} pelicula={pelicula} funcion={funcionElegida}>
          {dias.length === 0 ? (
            <p className="sin-funciones">Por ahora no hay funciones disponibles para esta película.</p>
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
            </>
          )}
      </ReservaFuncion>
    </main>
  );
}

export default PeliculaFunciones;
