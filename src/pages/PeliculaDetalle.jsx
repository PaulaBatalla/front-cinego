import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { solicitar } from "../services/api";
import peliculasLocales from "../data/peliculas.json";

function PeliculaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pelicula, setPelicula] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargarDetalle = async () => {
      try {
        const datos = await solicitar(`/peliculas/${id}`);
        if (activo) setPelicula(datos);
      } catch (err) {
        console.warn("Backend no disponible, usando detalle local:", err);
        const local = peliculasLocales.find((p) => String(p.id) === String(id));
        if (activo && local) {
          setPelicula({
            id: local.id,
            titulo: local.titulo,
            sinopsis: local.descripcion,
            duracion: "120 min",
            clasificacion: 13,
            posterUrl: local.imagen,
            precio: local.precio,
          });
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDetalle();
    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <div className="detalle-container">
        <p>Cargando detalle...</p>
      </div>
    );
  }

  if (!pelicula) {
    return (
      <div className="detalle-container">
        <h2>Película no encontrada</h2>
        <Link to="/" className="btn-volver">← Volver a películas</Link>
      </div>
    );
  }

  return (
    <div className="detalle-container">
      <Link to="/" className="btn-volver">← Volver a películas</Link>

      <div className="detalle-card">
        <img
          src={pelicula.posterUrl}
          alt={`Póster de ${pelicula.titulo}`}
          className="detalle-imagen"
        />
        <div className="detalle-info">
          <h2>{pelicula.titulo}</h2>
          <div className="etiquetas" style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
            {pelicula.clasificacion && (
              <span className="etiqueta" title="Clasificación por edad">
                +{pelicula.clasificacion}
              </span>
            )}
            {pelicula.duracion && <span className="etiqueta">{pelicula.duracion}</span>}
          </div>
          <p className="detalle-descripcion">{pelicula.sinopsis}</p>
          {pelicula.precio && (
            <p className="detalle-precio">Entrada: ${pelicula.precio}</p>
          )}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button
              className="btn-comprar"
              onClick={() => navigate(`/detalle/${id}/butacas`)}
            >
              Seleccionar butacas
            </button>
            <button
              className="btn-comprar"
              style={{ backgroundColor: "#3b3d5c" }}
              onClick={() => navigate(`/pelicula/${id}`)}
            >
              Ver funciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeliculaDetalle;
