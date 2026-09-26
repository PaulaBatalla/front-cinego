function PeliculaCard({ titulo, descripcion, precio, imagen }) {
  return (
    <div className="pelicula-card">
      <img src={imagen} alt={titulo} className="pelicula-imagen" />
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
      <p className="precio">${precio}</p>
    </div>
  );
}

export default PeliculaCard;