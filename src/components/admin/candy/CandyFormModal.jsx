import { useState } from "react";
import { CloseIcon } from "../../icons";
import { validarCandy } from "../../../utils/validaciones";
import Modal from "../Modal";

function formInicial(producto) {
  return {
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    precio: producto ? String(Number(producto.precio)) : "",
    imagenUrl: producto?.imagenUrl ?? "",
  };
}

// Lo que espera CandyRequestDTO en el back
function armarDatos(form) {
  return {
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    precio: Number(form.precio),
    imagenUrl: form.imagenUrl.trim() || null,
  };
}

// producto = null para agregar uno nuevo
function CandyFormModal({ producto, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => formInicial(producto));
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const esEdicion = Boolean(producto);
  const errores = validarCandy(form);
  const verError = (campo) => (intentado ? errores[campo] : null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIntentado(true);
    setErrorEnvio(null);

    if (Object.keys(errores).length > 0) {
      return;
    }

    setGuardando(true);

    try {
      await onGuardar(armarDatos(form));
    } catch (err) {
      setErrorEnvio(err.message);
      setGuardando(false);
    }
  };

  // Mientras guarda no se cierra, para no perder la respuesta del back
  const cerrar = () => {
    if (!guardando) onCerrar();
  };

  return (
    <Modal tituloId="candy-form-titulo" onCerrar={cerrar}>
      <div className="admin-modal__cabecera">
        <h2 id="candy-form-titulo" className="admin-modal__titulo">
          {esEdicion ? "Editar producto" : "Nuevo producto"}
        </h2>
        <button className="admin-modal__cerrar" type="button" aria-label="Cerrar" onClick={cerrar}>
          <CloseIcon className="admin-icon admin-icon--md" />
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        {errorEnvio && (
          <p className="admin-form__alerta" role="alert">
            {errorEnvio}
          </p>
        )}

        <label className="admin-campo">
          Nombre del producto
          <input
            className="admin-input"
            type="text"
            name="nombre"
            placeholder="Ej: Combo Pareja"
            maxLength={100}
            value={form.nombre}
            onChange={handleChange}
            aria-invalid={Boolean(verError("nombre"))}
            data-autofocus
          />
          {verError("nombre") && <span className="admin-campo__error">{errores.nombre}</span>}
        </label>

        <label className="admin-campo">
          Qué incluye
          <textarea
            className="admin-input admin-input--area"
            name="descripcion"
            rows="3"
            placeholder="Ej: Pochoclo grande + 2 gaseosas medianas"
            value={form.descripcion}
            onChange={handleChange}
          />
        </label>

        <label className="admin-campo">
          Precio ($)
          <input
            className="admin-input"
            type="number"
            name="precio"
            min="1"
            inputMode="numeric"
            placeholder="Ej: 12900"
            value={form.precio}
            onChange={handleChange}
            aria-invalid={Boolean(verError("precio"))}
          />
          {verError("precio") && <span className="admin-campo__error">{errores.precio}</span>}
        </label>

        <label className="admin-campo">
          Imagen (URL, opcional)
          <input
            className="admin-input"
            type="url"
            name="imagenUrl"
            placeholder="https://…"
            maxLength={255}
            value={form.imagenUrl}
            onChange={handleChange}
          />
          <span className="admin-campo__ayuda">
            Pegá el link de la imagen. Si lo dejás vacío se muestra un color.
          </span>
        </label>

        <div className="admin-modal__botones admin-modal__botones--pie">
          <button className="admin-boton-secundario" type="button" onClick={cerrar}>
            Cancelar
          </button>
          <button className="admin-boton-cta" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Agregar producto"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CandyFormModal;
