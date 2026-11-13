import { useState } from "react";
import { formatearPrecio } from "../../../utils/fechas";
import { colorDePelicula } from "../../../utils/peliculas";
import { CandyIcon, EditIcon, TrashIcon } from "../../icons";

function CandyTarjeta({ producto, onEditar, onEliminar }) {
  // Si el link de la imagen está roto se muestra el color, igual que sin imagen
  const [imagenFallida, setImagenFallida] = useState(null);
  const url = producto.imagenUrl?.trim();
  const mostrarImagen = Boolean(url) && url !== imagenFallida;

  return (
    <li className="admin-candy">
      <div
        className="admin-candy__imagen"
        style={{ background: colorDePelicula(producto.id) }}
        aria-hidden="true"
      >
        {mostrarImagen ? (
          <img
            className="admin-candy__foto"
            src={url}
            alt=""
            onError={() => setImagenFallida(url)}
          />
        ) : (
          <CandyIcon className="admin-candy__icono" />
        )}
      </div>

      <div className="admin-candy__cuerpo">
        <div className="admin-candy__textos">
          <h2 className="admin-candy__nombre">{producto.nombre}</h2>
          {producto.descripcion && (
            <p className="admin-candy__descripcion">{producto.descripcion}</p>
          )}
        </div>

        <span className="admin-candy__precio">{formatearPrecio(producto.precio)}</span>

        <div className="admin-candy__acciones">
          <button
            className="admin-boton-fila admin-candy__editar"
            type="button"
            aria-label={`Editar ${producto.nombre}`}
            onClick={() => onEditar(producto)}
          >
            <EditIcon />
            Editar
          </button>
          <button
            className="admin-boton-fila admin-boton-fila--peligro"
            type="button"
            aria-label={`Eliminar ${producto.nombre}`}
            onClick={() => onEliminar(producto)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  );
}

export default CandyTarjeta;
