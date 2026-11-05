import { useState } from "react";
import ConfirmarEliminar from "../components/admin/ConfirmarEliminar";
import SalaFormModal from "../components/admin/salas/SalaFormModal";
import SalaTarjeta from "../components/admin/salas/SalaTarjeta";
import { PlusIcon } from "../components/icons";
import { useAdminSalas } from "../hooks/useAdminSalas";

function AdminSalas() {
  const { salas, cargando, error, reintentar, funcionesDe, guardar, eliminar } = useAdminSalas();
  const [editor, setEditor] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const abrirNueva = () => setEditor({ sala: null });

  const handleGuardar = async (datos) => {
    await guardar(datos, editor.sala?.id);
    setEditor(null);
  };

  const handleConfirmarEliminar = () => {
    eliminar(aEliminar);
    setAEliminar(null);
  };

  // Una sala con funciones no se puede borrar: el back lo rechaza, así que se avisa antes
  const funcionesAEliminar = aEliminar ? funcionesDe(aEliminar.id) : 0;

  const renderContenido = () => {
    if (cargando) {
      return (
        <p className="admin-estado" role="status">
          Cargando salas...
        </p>
      );
    }

    if (error) {
      return (
        <div className="admin-vacio" role="alert">
          <span className="admin-vacio__texto">{error}</span>
          <button className="admin-boton-ghost" type="button" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      );
    }

    if (salas.length === 0) {
      return (
        <div className="admin-vacio">
          <span className="admin-vacio__texto">Todavía no hay salas. Agregá la primera.</span>
          <button
            className="admin-boton-cta admin-boton-cta--chico"
            type="button"
            onClick={abrirNueva}
          >
            Agregar sala
          </button>
        </div>
      );
    }

    return (
      <ul className="admin-salas">
        {salas.map((sala) => (
          <SalaTarjeta
            key={sala.id}
            sala={sala}
            cantidadFunciones={funcionesDe(sala.id)}
            onEditar={(seleccionada) => setEditor({ sala: seleccionada })}
            onEliminar={setAEliminar}
          />
        ))}
      </ul>
    );
  };

  return (
    <section className="admin-seccion" aria-labelledby="admin-salas-titulo">
      <div className="admin-seccion__encabezado">
        <div className="admin-seccion__copy">
          <h1 id="admin-salas-titulo" className="admin-titulo">
            Salas
          </h1>
          <span className="admin-seccion__subtitulo">
            La cantidad de asientos se define acá y vale para todas las funciones de la sala.
          </span>
        </div>

        <button
          className="admin-boton-cta"
          type="button"
          onClick={abrirNueva}
          disabled={cargando || Boolean(error)}
        >
          <PlusIcon />
          Agregar sala
        </button>
      </div>

      {renderContenido()}

      {editor && (
        <SalaFormModal
          sala={editor.sala}
          cantidadFunciones={editor.sala ? funcionesDe(editor.sala.id) : 0}
          onGuardar={handleGuardar}
          onCerrar={() => setEditor(null)}
        />
      )}

      {aEliminar &&
        (funcionesAEliminar > 0 ? (
          <ConfirmarEliminar
            bloqueado
            titulo={`No se puede eliminar “${aEliminar.nombre}”`}
            texto={`Tiene ${funcionesAEliminar} ${
              funcionesAEliminar === 1 ? "función programada" : "funciones programadas"
            }. Primero eliminá esas funciones o pasalas a otra sala.`}
            onCancelar={() => setAEliminar(null)}
          />
        ) : (
          <ConfirmarEliminar
            titulo={`¿Eliminar “${aEliminar.nombre}”?`}
            texto="La sala deja de estar disponible para nuevas funciones."
            onConfirmar={handleConfirmarEliminar}
            onCancelar={() => setAEliminar(null)}
          />
        ))}
    </section>
  );
}

export default AdminSalas;
