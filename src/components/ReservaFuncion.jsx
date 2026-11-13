import FichaPelicula from './funciones/FichaPelicula';
import { funcionDisponible } from '../utils/disponibilidadFunciones';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import SelectorAsientos from './SelectorAsientos';
import PasoCandy from './PasoCandy';
import ProgresoReserva from './funciones/ProgresoReserva';
import ResumenFuncion from './funciones/ResumenFuncion';
import { vaciarCandy } from '../store/slices/candySlice';
import { useAsientosQuery, useCrearReservaMutation, useMisReservasQuery } from '../services/reservasApi';
import { useAuth } from '../hooks/useAuth';
import { useNotificaciones } from '../hooks/useNotificaciones';
const moneda = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function ReservaFuncion({ funcion, pelicula, children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const candy = useSelector((state) => state.candy.items);
  const { notificar } = useNotificaciones();
  const { data: asientos, error: errorAsientos, isFetching, refetch } = useAsientosQuery(funcion?.id, { skip: !funcion, refetchOnMountOrArgChange: true });
  const [seleccionados, setSeleccionados] = useState([]);
  const [paso, setPaso] = useState('asientos');
  const [errorConfirmacion, setError] = useState('');
  const [crearReserva, { data: reservaCreada, isLoading: enviando }] = useCrearReservaMutation();
  const { data: misReservas } = useMisReservasQuery(undefined, { skip: !isAuthenticated || !reservaCreada, pollingInterval: 5000 });
  const reserva = misReservas?.find((r) => String(r.idReserva) === String(reservaCreada?.idReserva)) || reservaCreada;
  const error = errorConfirmacion || errorAsientos?.message;
  const vigente = funcion && funcionDisponible(funcion);
  const etiquetas = (asientos || []).filter((a) => seleccionados.includes(a.id)).map((a) => `${a.fila}${a.numero}`);
  // Precio con la promo aplicada: es lo que cobra el back al crear la reserva
  const precioEntrada = Number(funcion?.precioFinal ?? funcion?.precio ?? 0);
  const totalEntradas = precioEntrada * seleccionados.length;
  const totalCandy = paso === 'candy' ? candy.reduce((total, p) => total + p.precio * p.cantidad, 0) : 0;
  const total = reserva ? Number(reserva.total) : totalEntradas + totalCandy;
  const bloqueado = !vigente || isFetching || Boolean(errorAsientos) || enviando || !seleccionados.length;

  async function confirmar(omitirCandy = false) {
    if (!isAuthenticated || bloqueado || reserva) return;
    if (!funcionDisponible(funcion)) { setError('La función ya comenzó. Elegí otro horario.'); return; }
    setError('');
    try {
      const creada = await crearReserva({ funcionId: funcion.id, asientoIds: seleccionados }).unwrap();
      if (omitirCandy) dispatch(vaciarCandy());
      navigate(`/checkout/${creada.idReserva}`);
      notificar(`Reserva ${creada.estado === 'CONFIRMADA' ? 'confirmada' : 'creada'} para ${pelicula.titulo}`);
    } catch (err) {
      if (err.status === 409) {
        setSeleccionados([]); setPaso('asientos');
        notificar('Alguien reservó uno de esos asientos. Elegí otros', 'error');
      } else setError(err.message);
    }
  }
  function continuar() {
    if (bloqueado) return;
    setError(''); setPaso('candy');
  }
  const accion = paso === 'candy' ? () => confirmar() : continuar;
  const textoAccion = enviando ? 'Reservando...' : paso === 'candy' ? 'Crear reserva' : 'Continuar';
  const boton = <button type="button" className="boton-continuar" disabled={bloqueado} onClick={accion}>{textoAccion}</button>;
  const login = <Link className="boton-continuar reserva-login" to="/login" state={{ volverA: `/pelicula/${funcion?.peliculaId}?funcionId=${encodeURIComponent(funcion?.id)}` }}>Iniciar sesión para continuar</Link>;
  return <><FichaPelicula pelicula={pelicula} compacta={paso === 'candy' || Boolean(reserva)} /><div className={`funciones-layout${!reserva && funcion ? ' reserva-con-barra' : ''}`}>
    <section className="funciones-selector">
      <ProgresoReserva paso={reserva ? 3 : paso === 'candy' ? 2 : funcion ? 1 : 0} />
      {reserva ? <section className="reserva-final" role="status"><span className={`reserva-final-estado${reserva.estado !== 'CONFIRMADA' ? ' reserva-final-estado--pendiente' : ''}`}>Reserva #{reserva.idReserva} · {reserva.estado}</span><h2>{reserva.estado === 'CONFIRMADA' ? '¡Listo! Nos vemos en la función.' : reserva.estado === 'CANCELADA' ? 'Tu reserva fue cancelada.' : '¡Listo! Tu reserva fue creada.'}</h2><div className="reserva-ticket"><strong>{pelicula.titulo}</strong><p>{funcion.fecha} · {funcion.sala} · {funcion.hora}</p><p>Butacas: {etiquetas.join(', ')}</p><p>Total entradas: {moneda(Number(reserva.total))}</p>{reserva.estado === 'PENDIENTE' && <p>Tenés 10 minutos para confirmar en Mis reservas. Si cerrás sesión, se cancela.</p>}</div><Link to="/mis-reservas">Ver mis reservas y descargar entradas</Link><Link to="/">Hacer otra reserva</Link></section> : <>
        {(paso === 'asientos' || !vigente) ? <>{children}{funcion && <section className="funciones-asientos">
          {!vigente ? <p role="alert">Esta función ya comenzó. Elegí otro horario.</p> : <>
            {!asientos && !error && <p role="status">Cargando asientos...</p>}
            {asientos?.length === 0 && <p>Esta sala todavía no tiene asientos cargados.</p>}
            {asientos?.length > 0 && <fieldset disabled={enviando || isFetching || Boolean(errorAsientos)}><SelectorAsientos asientos={asientos} asientosSeleccionados={seleccionados} onCambiarAsiento={(id) => setSeleccionados((actuales) => actuales.includes(id) ? actuales.filter((a) => a !== id) : [...actuales, id])} /></fieldset>}
          </>}
        </section>}</> : <PasoCandy cantidad={seleccionados.length} onVolver={() => { setError(''); setPaso('asientos'); }} onOmitir={() => confirmar(true)} disabled={bloqueado} />}
        {error && <p role="alert">{error}</p>}
        {errorAsientos && <button type="button" className="reserva-enlace" disabled={isFetching} onClick={refetch}>Reintentar cargar asientos</button>}
      </>}
    </section>
    <ResumenFuncion titulo={pelicula.titulo} funcion={funcion}>
      <dl><div><dt>Asientos</dt><dd>{etiquetas.join(', ') || 'Sin elegir'}</dd></div></dl>
      <div className="reserva-desglose"><span>{seleccionados.length} entradas × {moneda(precioEntrada)}</span><span>{moneda(reserva ? Number(reserva.total) : totalEntradas)}</span></div>
      {!reserva && paso === 'candy' && candy.map((p) => <div className="reserva-desglose" key={p.id}><span>{p.cantidad} × {p.nombre}</span><span>{moneda(p.precio * p.cantidad)}</span></div>)}
      <div className="reserva-total" aria-live="polite"><span>{totalCandy && !reserva ? 'Total estimado' : 'Total'}</span><strong>{moneda(total)}</strong></div>
      {!reserva && <>{paso === 'asientos' && <p className="reserva-nota">En el próximo paso podés explorar Candy o continuar sin productos.</p>}{paso === 'candy' && totalCandy > 0 && <p className="reserva-nota">Se reservan únicamente las entradas ({moneda(totalEntradas)}). Candy no se cobra ni se incluye.</p>}<div className="reserva-accion-escritorio">{funcion && !isAuthenticated ? login : boton}</div></>}
    </ResumenFuncion>
    {!reserva && funcion && <div className="reserva-barra-movil"><div><span>{totalCandy ? 'Total estimado' : 'Total'}</span><strong>{moneda(total)}</strong></div>{isAuthenticated ? boton : login}</div>}
  </div></>;
}
