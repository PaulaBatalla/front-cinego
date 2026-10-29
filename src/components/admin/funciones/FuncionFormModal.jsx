import { useState } from "react";
import { CloseIcon } from "../../icons";
import { aMinutos, etiquetaDia, formatearMinutos, hoyIso } from "../../../utils/fechas";
import { buscarSuperposiciones, precioHabitual } from "../../../utils/funciones";
import { formatearDuracion } from "../../../utils/peliculas";
import { validarFuncion } from "../../../utils/validaciones";
import Modal from "../Modal";
import SelectorFechas from "./SelectorFechas";

// funcion = null para agregar; inicial = { peliculaId, salaId, fecha } con lo que conviene precargar
function FuncionFormModal({ funcion, inicial, peliculas, salas, funciones, onGuardar, onCerrar }) {
  const esEdicion = Boolean(funcion);
  const [form, setForm] = useState(() => {
    const salaId = String(funcion?.salaId ?? inicial.salaId ?? "");
    return {
      peliculaId: String(funcion?.peliculaId ?? inicial.peliculaId ?? ""),
      salaId,
      fechas: funcion ? [funcion.fecha] : inicial.fecha ? [inicial.fecha] : [],
      hora: funcion?.hora ?? "",
      precio: funcion ? String(Number(funcion.precio)) : precioHabitual(funciones, salaId),
    };
  });
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  const peliculaPorId = Object.fromEntries(peliculas.map((p) => [p.id, p]));
  const pelicula = peliculaPorId[form.peliculaId];
  const sala = salas.find((s) => s.id === Number(form.salaId));
  const inicio = aMinutos(form.hora);

  const errores = validarFuncion(form);
  const verError = (campo) => (intentado ? errores[campo] : null);

  const superposiciones = form.fechas.flatMap((fecha) =>
    buscarSuperposiciones(
      { fecha, hora: form.hora, salaId: form.salaId, duracion: pelicula?.duracion },
      funciones,
      (peliculaId) => peliculaPorId[peliculaId]?.duracion ?? 0,
      funcion?.id
    ).map((otra) => {
      const otraPelicula = peliculaPorId[otra.peliculaId];
      const otraFin = formatearMinutos(aMinutos(otra.hora) + (otraPelicula?.duracion ?? 0));
      return {
        clave: `${fecha}-${otra.id}`,
        texto: `${etiquetaDia(fecha)}: ${sala?.nombre ?? otra.salaNombre} ya tiene “${
          otraPelicula?.titulo ?? otra.peliculaTitulo
        }” de ${otra.hora} a ${otraFin}.`,
      };
    })
  );

  const cambiar = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }));

  const cambiarSala = (salaId) => {
    // Si todavía no puso precio, se completa con el habitual de la sala
    setForm((actual) => ({
      ...actual,
      salaId,
      precio: actual.precio || precioHabitual(funciones, salaId),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIntentado(true);
    setErrorEnvio(null);

    if (Object.keys(errores).length > 0 || superposiciones.length > 0) {
      return;
    }

    setGuardando(true);

    try {
      await onGuardar(form, [...form.fechas].sort());
    } catch (err) {
      setErrorEnvio(err.message);
      setGuardando(false);
    }
  };

  const cerrar = () => {
    if (!guardando) onCerrar();
  };

  const textoGuardar = () => {
    if (guardando) return "Guardando...";
    if (esEdicion) return "Guardar cambios";
    return form.fechas.length > 1 ? `Agregar ${form.fechas.length} funciones` : "Agregar función";
  };

  return (
    <Modal tituloId="funcion-form-titulo" onCerrar={cerrar}>
      <div className="admin-modal__cabecera">
        <h2 id="funcion-form-titulo" className="admin-modal__titulo">
          {esEdicion ? "Editar función" : "Nueva función"}
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
          Película
          <select
            className="admin-input admin-input--select-form"
            value={form.peliculaId}
            onChange={(event) => cambiar("peliculaId", event.target.value)}
            aria-invalid={Boolean(verError("peliculaId"))}
            data-autofocus
          >
            {!form.peliculaId && <option value="">Elegí una película</option>}
            {peliculas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}
          </select>
          {verError("peliculaId") && (
            <span className="admin-campo__error">{errores.peliculaId}</span>
          )}
        </label>

        <label className="admin-campo">
          Sala
          <select
            className="admin-input admin-input--select-form"
            value={form.salaId}
            onChange={(event) => cambiarSala(event.target.value)}
            aria-invalid={Boolean(verError("salaId"))}
          >
            {!form.salaId && <option value="">Elegí una sala</option>}
            {salas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} · {s.cantidadAsientos} asientos
              </option>
            ))}
          </select>
          {sala && (
            <span className="admin-campo__ayuda">Capacidad: {sala.cantidadAsientos} asientos.</span>
          )}
          {verError("salaId") && <span className="admin-campo__error">{errores.salaId}</span>}
        </label>

        <div className="admin-campo">
          <span>{esEdicion ? "Fecha" : "Fechas"}</span>
          {esEdicion ? (
            <input
              className="admin-input"
              type="date"
              aria-label="Fecha"
              min={hoyIso()}
              value={form.fechas[0] ?? ""}
              onChange={(event) => cambiar("fechas", event.target.value ? [event.target.value] : [])}
            />
          ) : (
            <SelectorFechas
              fechas={form.fechas}
              onCambiar={(fechas) => cambiar("fechas", fechas)}
            />
          )}
          {verError("fechas") && <span className="admin-campo__error">{errores.fechas}</span>}
        </div>

        <div className="admin-form__dos-columnas">
          <label className="admin-campo">
            Horario de inicio
            <input
              className="admin-input"
              type="time"
              value={form.hora}
              onChange={(event) => cambiar("hora", event.target.value)}
              aria-invalid={Boolean(verError("hora"))}
            />
            {verError("hora") && <span className="admin-campo__error">{errores.hora}</span>}
          </label>

          <label className="admin-campo">
            Precio por entrada ($)
            <input
              className="admin-input"
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="Ej: 8200"
              value={form.precio}
              onChange={(event) => cambiar("precio", event.target.value)}
              aria-invalid={Boolean(verError("precio"))}
            />
            {verError("precio") && <span className="admin-campo__error">{errores.precio}</span>}
          </label>
        </div>

        {pelicula && inicio !== null && (
          <p className="admin-form__nota">
            Termina aprox. a las <strong>{formatearMinutos(inicio + pelicula.duracion)}</strong> (la
            película dura {formatearDuracion(pelicula.duracion)}).
          </p>
        )}

        {superposiciones.length > 0 && (
          <div className="admin-aviso admin-aviso--error" role="alert">
            <strong className="admin-aviso__titulo">Este horario se superpone con otra función:</strong>
            {superposiciones.map((s) => (
              <span key={s.clave}>{s.texto}</span>
            ))}
            <span className="admin-aviso__ayuda">
              Cambiá el horario o elegí otra sala (se dejan 15 min de limpieza entre funciones).
            </span>
          </div>
        )}

        <div className="admin-modal__botones admin-modal__botones--pie">
          <button className="admin-boton-secundario" type="button" onClick={cerrar}>
            Cancelar
          </button>
          <button className="admin-boton-cta" type="submit" disabled={guardando}>
            {textoGuardar()}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default FuncionFormModal;
