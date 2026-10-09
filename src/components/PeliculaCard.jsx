import { Link } from "react-router-dom";

function PeliculaCard({ id, titulo, descripcion, precio, imagen }) {
  return (
    <div className="pelicula-card">
      <img src={imagen} alt={titulo} className="pelicula-imagen" />
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
      <p className="precio">${precio}</p>
      <Link to={`/pelicula/${id}`} className="btn-detalle">Ver detalle</Link>
    </div>
  );
}

export default PeliculaCard;