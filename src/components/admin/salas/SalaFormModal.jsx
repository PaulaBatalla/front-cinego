import { useState } from "react";
import { CloseIcon } from "../../icons";
import { MAX_ASIENTOS_POR_FILA, MAX_FILAS, validarSala } from "../../../utils/validaciones";
import Modal from "../Modal";
import MapaAsientos from "./MapaAsientos";

function SalaFormModal({ sala, cantidadFunciones = 0, onGuardar, onCerrar }) {
  const esEdicion = Boolean(sala);
  const [form, setForm] = useState({
    nombre: sala?.nombre ?? "",
    filas: String(sala?.filas || 8),
    asientosPorFila: String(sala?.asientosPorFila || 12),
  });
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const errores = validarSala(form);
  const verError = (campo) => (intentado ? errores[campo] : null);

  const filas = Math.min(Math.max(parseInt(form.filas, 10) || 0, 0), MAX_FILAS);
  const asientosPorFila = Math.min(
    Math.max(parseInt(form.asientosPorFila, 10) || 0, 0),
    MAX_ASIENTOS_POR_FILA
  );

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
      await onGuardar({
        nombre: form.nombre.trim(),
        filas: Number(form.filas),
        asientosPorFila: Number(form.asientosPorFila),
      });
    } catch (err) {
      setErrorEnvio(err.message);
      setGuardando(false);
    }
  };

  const cerrar = () => {
    if (!guardando) onCerrar();
  };

  return (
    <Modal tituloId="sala-form-titulo" onCerrar={cerrar}>
      <div className="admin-modal__cabecera">
        <h2 id="sala-form-titulo" className="admin-modal__titulo">
          {esEdicion ? "Editar sala" : "Nueva sala"}
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
          Nombre de la sala
          <input
            className="admin-input"
            type="text"
            name="nombre"
            placeholder="Ej: Sala 4 · 3D"
            maxLength={100}
            value={form.nombre}
            onChange={handleChange}
            aria-invalid={Boolean(verError("nombre"))}
            data-autofocus
          />
          {verError("nombre") && <span className="admin-campo__error">{errores.nombre}</span>}
        </label>

        <div className="admin-form__dos-columnas">
          <label className="admin-campo">
            Cantidad de filas
            <input
              className="admin-input"
              type="number"
              name="filas"
              min="1"
              max={MAX_FILAS}
              inputMode="numeric"
              placeholder="Ej: 8"
              value={form.filas}
              onChange={handleChange}
              aria-invalid={Boolean(verError("filas"))}
            />
            {verError("filas") && <span className="admin-campo__error">{errores.filas}</span>}
          </label>

          <label className="admin-campo">
            Asientos por fila
            <input
              className="admin-input"
              type="number"
              name="asientosPorFila"
              min="1"
              max={MAX_ASIENTOS_POR_FILA}
              inputMode="numeric"
              placeholder="Ej: 12"
              value={form.asientosPorFila}
              onChange={handleChange}
              aria-invalid={Boolean(verError("asientosPorFila"))}
            />
            {verError("asientosPorFila") && (
              <span className="admin-campo__error">{errores.asientosPorFila}</span>
            )}
          </label>
        </div>

        <div className="admin-sala-form__mapa">
          <MapaAsientos filas={filas} asientosPorFila={asientosPorFila} tamano={9} conEtiqueta />
        </div>

        <p className="admin-sala-form__total">
          Total:{" "}
          <strong>
            {errores.filas || errores.asientosPorFila ? "—" : `${filas * asientosPorFila} asientos`}
          </strong>
        </p>

        {esEdicion && cantidadFunciones > 0 && (
          <p className="admin-sala-form__nota">
            Esta sala tiene {cantidadFunciones}{" "}
            {cantidadFunciones === 1 ? "función programada" : "funciones programadas"}: el cambio
            se aplica a {cantidadFunciones === 1 ? "esa función" : "todas"}.
          </p>
        )}

        <div className="admin-modal__botones admin-modal__botones--pie">
          <button className="admin-boton-secundario" type="button" onClick={cerrar}>
            Cancelar
          </button>
          <button className="admin-boton-cta" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Agregar sala"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SalaFormModal;
