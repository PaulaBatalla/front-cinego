import { useState } from "react";
import { CloseIcon } from "../../icons";
import { leerDecimal, validarPelicula } from "../../../utils/validaciones";
import Modal from "../Modal";
import PosterMiniatura from "./PosterMiniatura";

function formInicial(pelicula) {
  return {
    posterUrl: pelicula?.posterUrl ?? "",
    titulo: pelicula?.titulo ?? "",
    duracion: pelicula ? String(pelicula.duracion) : "",
    clasificacion: pelicula ? String(pelicula.clasificacion) : "",
    sinopsis: pelicula?.sinopsis ?? "",
  };
}

// Lo que espera PeliculaRequestDTO en el back
function armarDatos(form) {
  return {
    titulo: form.titulo.trim(),
    duracion: Number(form.duracion),
    clasificacion: Math.round(leerDecimal(form.clasificacion) * 10) / 10,
    sinopsis: form.sinopsis.trim(),
    posterUrl: form.posterUrl.trim() || null,
  };
}

// pelicula = null para agregar una nueva; idColor elige el color de la vista previa
function PeliculaFormModal({ pelicula, idColor, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => formInicial(pelicula));
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const esEdicion = Boolean(pelicula);
  const errores = validarPelicula(form);
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
    <Modal tituloId="pelicula-form-titulo" onCerrar={cerrar}>
      <div className="admin-modal__cabecera">
        <h2 id="pelicula-form-titulo" className="admin-modal__titulo">
          {esEdicion ? "Editar película" : "Nueva película"}
        </h2>
        <button
          className="admin-modal__cerrar"
          type="button"
          aria-label="Cerrar"
          onClick={cerrar}
        >
          <CloseIcon className="admin-icon admin-icon--md" />
        </button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        {errorEnvio && (
          <p className="admin-form__alerta" role="alert">
            {errorEnvio}
          </p>
        )}

        <div className="admin-form__poster">
          <PosterMiniatura
            pelicula={{ id: idColor, titulo: form.titulo, posterUrl: form.posterUrl }}
            className="admin-form__poster-vista"
            conTitulo
          />
          <label className="admin-campo admin-campo--flex">
            Imagen del póster (URL)
            <input
              className="admin-input"
              type="url"
              name="posterUrl"
              placeholder="https://…"
              maxLength={255}
              value={form.posterUrl}
              onChange={handleChange}
              data-autofocus={esEdicion ? undefined : true}
            />
            <span className="admin-campo__ayuda">
              Pegá el link de la imagen. Si lo dejás vacío se muestra un color.
            </span>
          </label>
        </div>

        <label className="admin-campo">
          Título
          <input
            className="admin-input"
            type="text"
            name="titulo"
            placeholder="Ej: La Última Función"
            maxLength={150}
            value={form.titulo}
            onChange={handleChange}
            aria-invalid={Boolean(verError("titulo"))}
            data-autofocus={esEdicion ? true : undefined}
          />
          {verError("titulo") && <span className="admin-campo__error">{errores.titulo}</span>}
        </label>

        <div className="admin-form__dos-columnas">
          <label className="admin-campo">
            Duración (minutos)
            <input
              className="admin-input"
              type="number"
              name="duracion"
              min="1"
              inputMode="numeric"
              placeholder="Ej: 104"
              value={form.duracion}
              onChange={handleChange}
              aria-invalid={Boolean(verError("duracion"))}
            />
            {verError("duracion") && (
              <span className="admin-campo__error">{errores.duracion}</span>
            )}
          </label>

          <label className="admin-campo">
            Puntaje (0 a 10)
            <input
              className="admin-input"
              type="number"
              name="clasificacion"
              min="0"
              max="10"
              step="0.1"
              inputMode="decimal"
              placeholder="Ej: 8.1"
              value={form.clasificacion}
              onChange={handleChange}
              aria-invalid={Boolean(verError("clasificacion"))}
            />
            {verError("clasificacion") && (
              <span className="admin-campo__error">{errores.clasificacion}</span>
            )}
          </label>
        </div>

        <label className="admin-campo">
          Sinopsis
          <textarea
            className="admin-input admin-input--area"
            name="sinopsis"
            rows="4"
            placeholder="De qué trata la película, en 2 o 3 líneas."
            value={form.sinopsis}
            onChange={handleChange}
          />
        </label>

        <div className="admin-modal__botones admin-modal__botones--pie">
          <button className="admin-boton-secundario" type="button" onClick={cerrar}>
            Cancelar
          </button>
          <button className="admin-boton-cta" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Agregar película"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PeliculaFormModal;
