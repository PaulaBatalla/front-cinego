import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SelectorFuncion from "../components/SelectorFuncion";
import SelectorAsientos from "../components/SelectorAsientos";
import ResumenReserva from "../components/ResumenReserva";
import { useAuth } from "../hooks/useAuth";
import { reservaService } from "../services/reservaService";
import "../styles/reserva.css";

function ReservaPage() {
  const { isAuthenticated, token } = useAuth();
  const [params, setParams] = useSearchParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const funcionId = params.get("funcionId");

  useEffect(() => {
    if (!isAuthenticated) return;
    let activo = true;
    Promise.all([reservaService.peliculas(), reservaService.funciones()])
      .then(([peliculas, funciones]) => { if (activo) setDatos({ peliculas, funciones }); })
      .catch((err) => { if (activo) setError(err.message); });
    return () => { activo = false; };
  }, [isAuthenticated, token, intento]);

  if (!isAuthenticated) return (
    <main className="reserva-page">
      <h1>Reservar entradas</h1>
      <p>Iniciá sesión para reservar tus entradas.</p>
      <Link to="/login" state={{ volverA: `/reservas${funcionId ? `?funcionId=${encodeURIComponent(funcionId)}` : ""}` }}>Iniciar sesión</Link>
    </main>
  );
  if (error) return <main className="reserva-page"><p role="alert">{error}</p><button onClick={() => { setError(""); setIntento(intento + 1); }}>Reintentar</button></main>;
  if (!datos) return <p role="status">Cargando funciones...</p>;
  return <SeleccionReserva key={`${token}-${funcionId || "inicio"}`} datos={datos} funcionId={funcionId} onCambiarFuncion={(id) => setParams(id == null ? {} : { funcionId: id })} />;
}

function SeleccionReserva({ datos, funcionId, onCambiarFuncion }) {
  const funciones = datos.funciones.map((f) => ({ ...f, fecha: f.horarioInicio.slice(0, 10), hora: f.horarioInicio.slice(11, 16), sala: f.salaNombre }));
  const funcion = funciones.find((f) => String(f.id) === funcionId);
  const [peliculaId, setPeliculaId] = useState(String(funcion?.peliculaId ?? datos.peliculas[0]?.id ?? ""));
  const pelicula = datos.peliculas.find((p) => String(p.id) === peliculaId);
  const [asientos, setAsientos] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [reserva, setReserva] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!funcionId) return;
    let activo = true;
    reservaService.asientos(funcionId)
      .then((datos) => { if (activo) setAsientos(datos); })
      .catch((err) => { if (activo) setError(err.message); });
    return () => { activo = false; };
  }, [funcionId, intento]);

  async function confirmar() {
    if (enviando || reserva || !seleccionados.length) return;
    setEnviando(true);
    setError("");
    try {
      setReserva(await reservaService.crear(funcion.id, seleccionados));
    } catch (err) {
      setError(err.message);
      if (err.status === 409) {
        setSeleccionados([]);
        setAsientos(null);
        setIntento((valor) => valor + 1);
      }
    } finally {
      setEnviando(false);
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
        </section>
      ) : (
        <div className="reserva-layout">
          <div className="reserva-panel reserva-seleccion">
          <ol className="reserva-pasos" aria-label="Progreso de la reserva">
            <li className={funcion ? "reserva-paso-completo" : "reserva-paso-actual"} aria-current={!funcion ? "step" : undefined}><span>{funcion ? "✓" : "1"}</span> Función</li>
            <li className={funcion ? "reserva-paso-actual" : ""} aria-current={funcion ? "step" : undefined}><span>2</span> Asientos</li>
          </ol>
          <fieldset disabled={enviando}>
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
          {funcion && !asientos && error && <button onClick={() => { setError(""); setIntento(intento + 1); }}>Reintentar cargar asientos</button>}
          </div>
          <ResumenReserva pelicula={{ ...pelicula, precio: Number(funcion?.precio ?? 0) }} funcion={funcion} asientos={etiquetas} total={Number(funcion?.precio ?? 0) * seleccionados.length} onConfirmar={confirmar} enviando={enviando} />
        </div>
      )}
    </main>
  );
}

export default ReservaPage;
