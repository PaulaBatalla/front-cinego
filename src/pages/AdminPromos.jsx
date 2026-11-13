import { useState } from "react";
import ConfirmarEliminar from "../components/admin/ConfirmarEliminar";
import PromoFormModal from "../components/admin/promos/PromosFormModal";
import PromoTarjeta from "../components/admin/promos/PromoTarjeta";
import { PlusIcon } from "../components/icons";
import { useAdminPromos } from "../hooks/useAdminPromos";

function AdminPromos() {
  const { promos, peliculas, cargando, error, reintentar, guardar, cambiarEstado, eliminar } =
    useAdminPromos();
  const [editor, setEditor] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  const activas = promos.filter((promo) => promo.activo).length;

  const abrirNueva = () => setEditor({ promo: null });

  const handleGuardar = async (datos) => {
    await guardar(datos, editor.promo?.id);
    setEditor(null);
  };

  const handleConfirmarEliminar = () => {
    eliminar(aEliminar);
    setAEliminar(null);
  };

  const renderContenido = () => {
    if (cargando) {
      return (
        <p className="admin-estado" role="status">
          Cargando promos...
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

    if (promos.length === 0) {
      return (
        <div className="admin-vacio">
          <span className="admin-vacio__texto">
            Todavía no hay promos. Las promos activas se muestran en la página de inicio y se
            aplican solas al comprar.
          </span>
          <button
            className="admin-boton-cta admin-boton-cta--chico"
            type="button"
            onClick={abrirNueva}
          >
            Agregar promo
          </button>
        </div>
      );
    }

    return (
      <ul className="admin-promos">
        {promos.map((promo) => (
          <PromoTarjeta
            key={promo.id}
            promo={promo}
            onCambiarEstado={cambiarEstado}
            onEditar={(seleccionada) => setEditor({ promo: seleccionada })}
            onEliminar={setAEliminar}
          />
        ))}
      </ul>
    );
  };

  return (
    <section className="admin-seccion" aria-labelledby="admin-promos-titulo">
      <div className="admin-seccion__encabezado">
        <div className="admin-seccion__copy">
          <h1 id="admin-promos-titulo" className="admin-titulo">
            Promos en entradas
          </h1>
          {!cargando && !error && promos.length > 0 && (
            <span className="admin-seccion__subtitulo">
              {activas === 1 ? "1 activa" : `${activas} activas`} · se muestran en la página de
              inicio y se aplican solas al comprar
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
          Agregar promo
        </button>
      </div>

      {renderContenido()}

      {editor && (
        <PromoFormModal
          promo={editor.promo}
          peliculas={peliculas}
          onGuardar={handleGuardar}
          onCerrar={() => setEditor(null)}
        />
      )}

      {aEliminar && (
        <ConfirmarEliminar
          titulo={`¿Eliminar “${aEliminar.nombre}”?`}
          texto="La promo deja de aplicarse y desaparece de la página de inicio. Si solo querés pausarla, usá el interruptor “Activa”."
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </section>
  );
}

export default AdminPromos;
