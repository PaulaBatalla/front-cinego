import { TrashIcon } from "../icons";
import Modal from "./Modal";

// Confirmación antes de borrar algo del panel (películas y, más adelante, el resto de las secciones)
function ConfirmarEliminar({ titulo, texto, onConfirmar, onCancelar }) {
  return (
    <Modal
      rol="alertdialog"
      tituloId="confirmar-titulo"
      descripcionId="confirmar-texto"
      className="admin-modal--confirmar"
      onCerrar={onCancelar}
    >
      <span className="admin-confirmar__icono">
        <TrashIcon className="admin-confirmar__svg" />
      </span>
      <h2 id="confirmar-titulo" className="admin-confirmar__titulo">
        {titulo}
      </h2>
      <p id="confirmar-texto" className="admin-confirmar__texto">
        {texto}
      </p>
      <div className="admin-modal__botones">
        <button className="admin-boton-secundario" type="button" onClick={onCancelar} data-autofocus>
          Cancelar
        </button>
        <button className="admin-boton-peligro" type="button" onClick={onConfirmar}>
          Sí, eliminar
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmarEliminar;
