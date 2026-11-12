import './SelectorAsientos.css';

export default function SelectorAsientos({ asientos, asientosSeleccionados, onCambiarAsiento }) {
  const filas = [...new Set(asientos.map((a) => a.fila))].sort();
  return <section className="selector-butacas-container" aria-label="Selección de butacas">
    <div className="butacas-cabecera"><h2 className="selector-titulo">Asientos</h2><div className="leyenda" aria-label="Estados de las butacas"><span><i className="dot libre" />Libre</span><span><i className="dot seleccionada" />Tuyo</span><span><i className="dot ocupada" />Ocupado</span></div></div>
    <div className="pantalla-wrapper"><div className="pantalla" /><span>Pantalla</span></div>
    <div className="grilla" tabIndex={0} aria-label="Mapa de butacas; desplazá horizontalmente para ver toda la sala">
      {filas.map((fila) => {
        const butacas = asientos.filter((a) => a.fila === fila).sort((a, b) => a.numero - b.numero);
        return <div className="fila" key={fila}><span className="fila-label">{fila}</span><div className="fila-butacas">
          {butacas.map((a, i) => {
            const seleccionado = asientosSeleccionados.includes(a.id);
            const estado = a.ocupado ? 'ocupada' : seleccionado ? 'seleccionada' : 'libre';
            const pasillo = butacas.length >= 8 && (i === Math.floor(butacas.length / 3) || i === Math.ceil(butacas.length * 2 / 3));
            return <button key={a.id} type="button" className={`butaca ${estado}${pasillo ? ' butaca--pasillo' : ''}`} disabled={a.ocupado} aria-pressed={seleccionado} aria-label={`Butaca ${a.fila}${a.numero}${a.ocupado ? ', ocupada' : ''}`} onClick={() => onCambiarAsiento(a.id)} title={`Butaca ${a.fila}${a.numero}`}><span>{a.numero}</span></button>;
          })}
        </div><span className="fila-label" aria-hidden="true">{fila}</span></div>;
      })}
    </div>
    <p className="butacas-ayuda">Elegí tus butacas. Pasá el cursor o enfocá una para ver su número.</p>
  </section>;
}
