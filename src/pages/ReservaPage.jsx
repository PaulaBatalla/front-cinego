import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SelectorFuncion from "../components/SelectorFuncion";
import SelectorAsientos from "../components/SelectorAsientos";
import ResumenReserva from "../components/ResumenReserva";
import { useAuth } from "../hooks/useAuth";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { usePeliculasQuery, useFuncionesQuery, useAsientosQuery, useCrearReservaMutation } from "../services/reservasApi";
import "../styles/reserva.css";

function ReservaPage() {
  const { isAuthenticated, token } = useAuth();
  const [params, setParams] = useSearchParams();
  const peliculas = usePeliculasQuery(undefined, { skip: !isAuthenticated });
  const funciones = useFuncionesQuery(undefined, { skip: !isAuthenticated });
  const error = peliculas.error || funciones.error;
  const datos = peliculas.data && funciones.data
    ? { peliculas: peliculas.data, funciones: funciones.data }
    : null;
  const funcionId = params.get("funcionId");
  const reintentar = () => { peliculas.refetch(); funciones.refetch(); };

  if (!isAuthenticated) return (
    <main className="reserva-page">
      <h1>Reservar entradas</h1>
      <p>Iniciá sesión para reservar tus entradas.</p>
      <Link to="/login" state={{ volverA: `/reservas${funcionId ? `?funcionId=${encodeURIComponent(funcionId)}` : ""}` }}>Iniciar sesión</Link>
    </main>
  );
  if (error) return <main className="reserva-page"><p role="alert">{error.message}</p><button onClick={reintentar}>Reintentar</button></main>;
  if (!datos) return <p role="status">Cargando funciones...</p>;
  return <SeleccionReserva key={`${token}-${funcionId || "inicio"}`} datos={datos} funcionId={funcionId} onCambiarFuncion={(id) => setParams(id == null ? {} : { funcionId: id })} />;
}

function SeleccionReserva({ datos, funcionId, onCambiarFuncion }) {
  const navigate = useNavigate();
  const funciones = datos.funciones.map((f) => ({ ...f, fecha: f.horarioInicio.slice(0, 10), hora: f.horarioInicio.slice(11, 16), sala: f.salaNombre }));
  const funcion = funciones.find((f) => String(f.id) === funcionId);
  const [peliculaId, setPeliculaId] = useState(String(funcion?.peliculaId ?? datos.peliculas[0]?.id ?? ""));
  const pelicula = datos.peliculas.find((p) => String(p.id) === peliculaId);
  const { data: asientos, error: errorAsientos, isFetching, refetch } = useAsientosQuery(funcionId, {
    skip: !funcionId || !funcion,
    refetchOnMountOrArgChange: true,
  });
  const [seleccionados, setSeleccionados] = useState([]);
  const [errorConfirmacion, setError] = useState("");
  const [crearReserva, { data: reserva, isLoading: enviando }] = useCrearReservaMutation();
  const error = errorConfirmacion || errorAsientos?.message;
  const { notificar } = useNotificaciones();

  async function confirmar() {
    if (enviando || isFetching || errorAsientos || reserva || !seleccionados.length) return;
    setError("");
    try {
      const creada = await crearReserva({ funcionId: funcion.id, asientoIds: seleccionados }).unwrap();
      navigate(`/checkout/${creada.idReserva}`);
    } catch (err) {
      if (err.status === 409) {
        notificar("Alguien reservó uno de esos asientos. Elegí otros", "error");
        setSeleccionados([]);
      } else {
        setError(err.message);
      }
    }
  }

  if (funcionId && !funcion) return <main className="reserva-page"><p>La función no existe.</p><Link to="/reservas">Elegir otra función</Link></main>;
  if (!pelicula) return <p>No hay películas disponibles.</p>;
  const disponibles = funciones.filter((f) => String(f.peliculaId) === peliculaId);
  const etiquetas = (asientos || []).filter((a) => seleccionados.includes(a.id)).map((a) => `${a.fila}${a.numero}`);

  return (
    <main className="reserva-page">
      <Link className="reserva-volver" to="/">← Volver a la cartelera</Link>
      <header className="reserva-ficha">
        {pelicula.posterUrl ? <img className="reserva-poster" src={pelicula.posterUrl} alt={pelicula.titulo} /> : <div className="reserva-poster reserva-poster--alternativo"><span>CINEGO · EN CARTELERA</span><strong>{pelicula.titulo}</strong></div>}
        <div className="reserva-ficha-info"><h1>{pelicula.titulo}</h1>{pelicula.sinopsis && <p>{pelicula.sinopsis}</p>}</div>
      </header>
      {reserva ? (
        <section role="status">
          <h2>Reserva creada</h2>
          <p>Número: {reserva.idReserva} · Estado: {reserva.estado}</p>
          <p>{pelicula.titulo} · {funcion.fecha} · {funcion.hora} · {funcion.sala}</p>
          <p>Asientos: {etiquetas.join(", ")}</p>
          <p>Total: ${reserva.total}</p>
          <Link to="/">Volver a la cartelera</Link>
          <Link to="/mis-reservas">Ver mis reservas</Link>
        </section>
      ) : (
        <div className="reserva-layout">
          <div className="reserva-panel reserva-seleccion">
          <ol className="reserva-pasos" aria-label="Progreso de la reserva">
            <li className={funcion ? "reserva-paso-completo" : "reserva-paso-actual"} aria-current={!funcion ? "step" : undefined}><span>{funcion ? "✓" : "1"}</span> Función</li>
            <li className={funcion ? "reserva-paso-actual" : ""} aria-current={funcion ? "step" : undefined}><span>2</span> Asientos</li>
          </ol>
          <fieldset disabled={enviando || isFetching}>
            <label htmlFor="pelicula">Película</label>
            <select id="pelicula" value={peliculaId} disabled={Boolean(funcionId)} onChange={(e) => setPeliculaId(e.target.value)}>
              {datos.peliculas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </select>
            {funcionId ? <Link to="/reservas">Cambiar película o función</Link> : null}
            <SelectorFuncion key={peliculaId} funciones={disponibles} funcionSeleccionada={funcion} onSeleccionar={(f) => onCambiarFuncion(f?.id)} />
            {!disponibles.length && <p>No hay funciones disponibles para esta película.</p>}
            {!funcion && <section className="reserva-espera"><h2>Asientos</h2><p>Elegí una función para ver las butacas disponibles.</p></section>}
            {funcion && !asientos && !error && <p role="status">Cargando asientos...</p>}
            {funcion && asientos && <SelectorAsientos asientos={asientos} asientosSeleccionados={seleccionados} onCambiarAsiento={(id) => setSeleccionados((actuales) => actuales.includes(id) ? actuales.filter((a) => a !== id) : [...actuales, id])} />}
            {asientos?.length === 0 && <p>Esta sala todavía no tiene asientos cargados.</p>}
          </fieldset>
          {error && <p role="alert">{error}</p>}
          {funcion && errorAsientos && <button onClick={refetch} disabled={isFetching}>Reintentar cargar asientos</button>}
          </div>
          <ResumenReserva pelicula={{ ...pelicula, precio: Number(funcion?.precio ?? 0) }} funcion={funcion} asientos={etiquetas} total={Number(funcion?.precio ?? 0) * seleccionados.length} onConfirmar={confirmar} enviando={enviando} />
        </div>
      )}
    </main>
  );
}

export default ReservaPage;
