import { useState } from "react";
import ConfirmarEliminar from "../components/admin/ConfirmarEliminar";
import BarraDia from "../components/admin/funciones/BarraDia";
import FuncionFila from "../components/admin/funciones/FuncionFila";
import FuncionFormModal from "../components/admin/funciones/FuncionFormModal";
import TiraFechas from "../components/admin/funciones/TiraFechas";
import { PlusIcon } from "../components/icons";
import { useAdminFunciones } from "../hooks/useAdminFunciones";
import { aMinutos, etiquetaDia, fechaLarga, hoyIso } from "../utils/fechas";

// Días para la tira: hoy, los que vienen con funciones y el elegido (aunque sea pasado)
function armarDias(funciones, diaElegido) {
  const hoy = hoyIso();
  const cantidades = {};

  funciones.forEach(({ fecha }) => {
    cantidades[fecha] = (cantidades[fecha] || 0) + 1;
  });

  const fechas = new Set(Object.keys(cantidades).filter((fecha) => fecha >= hoy));
  fechas.add(hoy);
  fechas.add(diaElegido);

  return [...fechas].sort().map((fecha) => ({ fecha, cantidad: cantidades[fecha] || 0 }));
}

function AdminFunciones() {
  const { funciones, peliculas, salas, cargando, error, reintentar, guardar, eliminar } =
    useAdminFunciones();
  const [diaElegido, setDiaElegido] = useState(hoyIso);
  const [peliculaFiltro, setPeliculaFiltro] = useState("todas");
  // null: cerrado · { funcion: null }: nueva · { funcion }: edición
  const [editor, setEditor] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const peliculaPorId = Object.fromEntries(peliculas.map((p) => [p.id, p]));
  const salaPorId = Object.fromEntries(salas.map((s) => [s.id, s]));

  const describir = (funcion) =>
    `${peliculaPorId[funcion.peliculaId]?.titulo ?? funcion.peliculaTitulo} · ${etiquetaDia(
      funcion.fecha
    )} ${funcion.hora}`;

  const abrirNueva = () => setEditor({ funcion: null });

  // Arranca con la película del filtro, la primera sala y el día elegido (si no pasó)
  const valoresIniciales = {
    peliculaId: peliculaFiltro !== "todas" ? peliculaFiltro : peliculas[0]?.id,
    salaId: salas[0]?.id,
    fecha: diaElegido >= hoyIso() ? diaElegido : null,
  };

  const handleGuardar = async (datos, fechas) => {
    await guardar(datos, fechas, editor.funcion?.id);
    setEditor(null);
    // Si las funciones quedaron en otro día, la lista salta a ese día
    if (!fechas.includes(diaElegido)) setDiaElegido(fechas[0]);
  };

  const handleConfirmarEliminar = () => {
    eliminar(aEliminar);
    setAEliminar(null);
  };
  const proximas = funciones.filter((funcion) => funcion.fecha >= hoyIso()).length;
  const delDia = funciones.filter((funcion) => funcion.fecha === diaElegido);
  const funcionesVisibles = delDia
    .filter(
      (funcion) => peliculaFiltro === "todas" || String(funcion.peliculaId) === peliculaFiltro
    )
    .sort((a, b) => aMinutos(a.hora) - aMinutos(b.hora) || a.salaId - b.salaId);

  const renderContenido = () => {
    if (funcionesVisibles.length === 0) {
      return (
        <div className="admin-vacio">
          <span className="admin-vacio__texto">
            {delDia.length
              ? "No hay funciones de esa película este día."
              : `No hay funciones el ${fechaLarga(diaElegido, { conHoy: false }).toLowerCase()}. Agregá una o copiá otro día.`}
          </span>
          <button
            className="admin-boton-cta admin-boton-cta--chico"
            type="button"
            onClick={abrirNueva}
          >
            Agregar función
          </button>
        </div>
      );
    }

    return (
      <ul className="admin-lista">
        {funcionesVisibles.map((funcion) => (
          <FuncionFila
            key={funcion.id}
            funcion={funcion}
            pelicula={peliculaPorId[funcion.peliculaId]}
            sala={salaPorId[funcion.salaId]}
            onEditar={(seleccionada) => setEditor({ funcion: seleccionada })}
            onEliminar={setAEliminar}
          />
        ))}
      </ul>
    );
  };

  return (
    <section className="admin-seccion" aria-labelledby="admin-funciones-titulo">
      <div className="admin-seccion__encabezado">
        <div className="admin-seccion__copy">
          <h1 id="admin-funciones-titulo" className="admin-titulo">
            Funciones
          </h1>
          {!cargando && !error && (
            <span className="admin-seccion__subtitulo">
              {proximas} {proximas === 1 ? "función programada" : "funciones programadas"}
            </span>
          )}
        </div>

        <button
          className="admin-boton-cta"
          type="button"
          onClick={abrirNueva}
          disabled={cargando || Boolean(error)}
        >
          <PlusIcon />
          Agregar función
        </button>
      </div>

      {cargando && (
        <p className="admin-estado" role="status">
          Cargando funciones...
        </p>
      )}

      {error && (
        <div className="admin-vacio" role="alert">
          <span className="admin-vacio__texto">{error}</span>
          <button className="admin-boton-ghost" type="button" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && (
        <>
          <div className="admin-dia">
            <TiraFechas
              dias={armarDias(funciones, diaElegido)}
              diaElegido={diaElegido}
              onElegir={setDiaElegido}
            />
            <BarraDia
              dia={diaElegido}
              cantidad={delDia.length}
              peliculas={peliculas}
              peliculaFiltro={peliculaFiltro}
              onFiltrar={setPeliculaFiltro}
            />
          </div>

          {renderContenido()}
        </>
      )}

      {editor && (
        <FuncionFormModal
          funcion={editor.funcion}
          inicial={valoresIniciales}
          peliculas={peliculas}
          salas={salas}
          funciones={funciones}
          onGuardar={handleGuardar}
          onCerrar={() => setEditor(null)}
        />
      )}

      {aEliminar && (
        <ConfirmarEliminar
          titulo={`¿Eliminar “${describir(aEliminar)}”?`}
          texto="La función deja de aparecer en la cartelera y ya no se pueden comprar entradas para ella."
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}    </section>
  );
}

export default AdminFunciones;
