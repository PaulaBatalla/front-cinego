import { useParams, Link, useNavigate } from "react-router-dom";
import peliculas from "../data/peliculas.json";

function PeliculaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const pelicula = peliculas.find((p) => p.id === Number(id));

  if (!pelicula) {
    return (
      <div className="detalle-container">
        <h2>Película no encontrada</h2>
        <Link to="/" className="btn-volver">← Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="detalle-container">
      <Link to="/" className="btn-volver">← Volver al catálogo</Link>

      <div className="detalle-card">
        <img
          src={pelicula.imagen}
          alt={pelicula.titulo}
          className="detalle-imagen"
        />
        <div className="detalle-info">
          <h2>{pelicula.titulo}</h2>
          <p className="detalle-descripcion">{pelicula.descripcion}</p>
          <p className="detalle-precio">Precio: ${pelicula.precio}</p>
          <button className="btn-comprar" onClick={() => navigate(`/pelicula/${id}/butacas`)}>Seleccionar butacas</button>
        </div>
      </div>
    </div>
  );
}

export default PeliculaDetalle;
