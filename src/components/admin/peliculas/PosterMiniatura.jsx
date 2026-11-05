import { useState } from "react";
import { colorDePelicula } from "../../../utils/peliculas";

// Póster chico de la película; si no tiene imagen (o el link está roto) muestra un color
function PosterMiniatura({ pelicula, className = "", conTitulo = false }) {
  const [urlFallida, setUrlFallida] = useState(null);
  const url = pelicula.posterUrl?.trim();
  const mostrarImagen = Boolean(url) && url !== urlFallida;

  return (
    <span
      className={`admin-poster ${className}`.trim()}
      style={{ background: colorDePelicula(pelicula.id) }}
      aria-hidden="true"
    >
      {mostrarImagen ? (
        <img
          className="admin-poster__imagen"
          src={url}
          alt=""
          onError={() => setUrlFallida(url)}
        />
      ) : (
        conTitulo && (
          <span className="admin-poster__titulo">{pelicula.titulo || "Título"}</span>
        )
      )}
    </span>
  );
}

export default PosterMiniatura;
