import { useState } from 'react';
import { colorDePelicula, formatearDuracion } from '../../utils/peliculas';

export default function FichaPelicula({ pelicula, compacta = false }) {
  const [fallida, setFallida] = useState(null);
  const url = pelicula.posterUrl?.trim();
  return <section className={`pelicula-detalle${compacta ? ' pelicula-detalle--compacta' : ''}`}>
    <div className="pelicula-detalle-poster" style={{ background: colorDePelicula(pelicula.id) }}>
      {url && fallida !== url ? <img src={url} alt={`Póster de ${pelicula.titulo}`} onError={() => setFallida(url)} /> : <><span>CINEGO · EN CARTELERA</span><strong>{pelicula.titulo}</strong></>}
    </div>
    <div><h1>{pelicula.titulo}</h1><div className="etiquetas"><span className="etiqueta" title="Clasificación por edad">+{pelicula.clasificacion}</span><span className="etiqueta">{formatearDuracion(pelicula.duracion)}</span></div>
      {!compacta && <><h2 className="selector-titulo">Sinopsis</h2><p className="sinopsis">{pelicula.sinopsis}</p></>}
    </div>
  </section>;
}
