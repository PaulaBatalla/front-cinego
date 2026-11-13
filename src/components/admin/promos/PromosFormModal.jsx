import { useState } from "react";
import { CloseIcon } from "../../icons";
import { formatearPrecio } from "../../../utils/fechas";
import { leerPorcentaje, validarPromo } from "../../../utils/validaciones";
import Modal from "../Modal";

// Precio de ejemplo para mostrar cómo queda una entrada con el descuento
const PRECIO_EJEMPLO = 8200;

function formInicial(promo) {
  return {
    nombre: promo?.nombre ?? "",
    porcentaje: promo ? String(promo.porcentaje) : "",
    todas: promo ? promo.aplicaATodas : true,
    peliculas: promo?.peliculaIds ?? [],
    activo: promo ? promo.activo : true,
  };
}

// Lo que espera DescuentoRequestDTO en el back
function armarDatos(form) {
  return {
    nombre: form.nombre.trim(),
    porcentaje: leerPorcentaje(form.porcentaje),
    aplicaATodas: form.todas,
    peliculaIds: form.todas ? [] : form.peliculas,
    activo: form.activo,
  };
}

// promo = null para agregar una nueva; peliculas = las que se pueden elegir
function PromoFormModal({ promo, peliculas, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => formInicial(promo));
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const esEdicion = Boolean(promo);
  const errores = validarPromo(form);
  const verError = (campo) => (intentado ? errores[campo] : null);
  const porcentaje = leerPorcentaje(form.porcentaje);

  const cambiar = (cambios) => setForm((actual) => ({ ...actual, ...cambios }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    cambiar({ [name]: value });
  };

  const alternarPelicula = (id) => {
    setForm((actual) => ({
      ...actual,
      peliculas: actual.peliculas.includes(id)
        ? actual.peliculas.filter((elegida) => elegida !== id)
        : [...actual.peliculas, id],
    }));
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
    <Modal tituloId="promo-form-titulo" onCerrar={cerrar}>
      <div className="admin-modal__cabecera">
        <h2 id="promo-form-titulo" className="admin-modal__titulo">
          {esEdicion ? "Editar promo" : "Nueva promo"}
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
          Nombre de la promo
          <input
            className="admin-input"
            type="text"
            name="nombre"
            placeholder="Ej: Miércoles de cine"
            maxLength={100}
            value={form.nombre}
            onChange={handleChange}
            aria-invalid={Boolean(verError("nombre"))}
            data-autofocus
          />
          {verError("nombre") && <span className="admin-campo__error">{errores.nombre}</span>}
        </label>

        <label className="admin-campo">
          Descuento (%)
          <span className="admin-input-sufijo">
            <input
              className="admin-input"
              type="number"
              name="porcentaje"
              min="1"
              max="90"
              step="any"
              inputMode="decimal"
              placeholder="Ej: 30"
              value={form.porcentaje}
              onChange={handleChange}
              aria-invalid={Boolean(verError("porcentaje"))}
            />
            <span className="admin-input-sufijo__texto" aria-hidden="true">
              %
            </span>
          </span>
          {verError("porcentaje") && (
            <span className="admin-campo__error">{errores.porcentaje}</span>
          )}
          {!errores.porcentaje && (
            <span className="admin-campo__exito">
              Ejemplo: una entrada de {formatearPrecio(PRECIO_EJEMPLO)} queda en{" "}
              {formatearPrecio(PRECIO_EJEMPLO * (1 - porcentaje / 100))}.
            </span>
          )}
        </label>

        <div className="admin-campo">
          <span id="promo-alcance">¿En qué películas se aplica?</span>
          <div className="admin-segmentado" role="group" aria-labelledby="promo-alcance">
            <button
              className="admin-segmentado__opcion"
              type="button"
              aria-pressed={form.todas}
              onClick={() => cambiar({ todas: true })}
            >
              Todas
            </button>
            <button
              className="admin-segmentado__opcion"
              type="button"
              aria-pressed={!form.todas}
              onClick={() => cambiar({ todas: false })}
            >
              Solo algunas
            </button>
          </div>

          {!form.todas && (
            <>
              <div className="admin-promo-form__peliculas" role="group" aria-label="Películas">
                {peliculas.map((pelicula) => {
                  const elegida = form.peliculas.includes(pelicula.id);
                  return (
                    <button
                      key={pelicula.id}
                      className={`admin-chip${elegida ? " is-activo" : ""}`}
                      type="button"
                      aria-pressed={elegida}
                      onClick={() => alternarPelicula(pelicula.id)}
                    >
                      {pelicula.titulo}
                    </button>
                  );
                })}
              </div>
              {verError("peliculas") && (
                <span className="admin-campo__error">{errores.peliculas}</span>
              )}
            </>
          )}
        </div>

        <button
          className="admin-switch admin-switch--form"
          type="button"
          role="switch"
          aria-checked={form.activo}
          onClick={() => cambiar({ activo: !form.activo })}
        >
          <span className="admin-switch__pista" aria-hidden="true">
            <span className="admin-switch__perilla" />
          </span>
          Promo activa (se muestra en la página de inicio)
        </button>

        <div className="admin-modal__botones admin-modal__botones--pie">
          <button className="admin-boton-secundario" type="button" onClick={cerrar}>
            Cancelar
          </button>
          <button className="admin-boton-cta" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Agregar promo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PromoFormModal;
