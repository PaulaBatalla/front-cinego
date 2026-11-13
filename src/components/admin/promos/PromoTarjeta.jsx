import { formatearPorcentaje, textoAplica } from "../../../utils/promos";
import { EditIcon, TrashIcon } from "../../icons";

function PromoTarjeta({ promo, onCambiarEstado, onEditar, onEliminar }) {
  return (
    <li className={`admin-promo${promo.activo ? "" : " is-pausada"}`}>
      <div className="admin-promo__datos">
        <span className="admin-promo__porcentaje">{formatearPorcentaje(promo.porcentaje)}</span>
        <div className="admin-promo__textos">
          <h2 className="admin-promo__nombre">{promo.nombre}</h2>
          <span className="admin-promo__aplica">{textoAplica(promo)}</span>
        </div>
      </div>

      <button
        className="admin-switch"
        type="button"
        role="switch"
        aria-checked={promo.activo}
        aria-label={`${promo.nombre}: ${promo.activo ? "activa" : "pausada"}`}
        onClick={() => onCambiarEstado(promo)}
      >
        <span className="admin-switch__pista" aria-hidden="true">
          <span className="admin-switch__perilla" />
        </span>
        {promo.activo ? "Activa: se muestra y se aplica" : "Pausada: no se aplica"}
      </button>

      <div className="admin-promo__acciones">
        <button
          className="admin-boton-fila admin-promo__editar"
          type="button"
          aria-label={`Editar ${promo.nombre}`}
          onClick={() => onEditar(promo)}
        >
          <EditIcon />
          Editar
        </button>
        <button
          className="admin-boton-fila admin-boton-fila--peligro"
          type="button"
          aria-label={`Eliminar ${promo.nombre}`}
          onClick={() => onEliminar(promo)}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

export default PromoTarjeta;
