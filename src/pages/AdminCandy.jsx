import { useState } from "react";
import ConfirmarEliminar from "../components/admin/ConfirmarEliminar";
import CandyFormModal from "../components/admin/candy/CandyFormModal";
import CandyTarjeta from "../components/admin/candy/CandyTarjeta";
import { PlusIcon } from "../components/icons";
import { useAdminCandy } from "../hooks/useAdminCandy";

function AdminCandy() {
  const { productos, cargando, error, reintentar, guardar, eliminar } = useAdminCandy();
  const [editor, setEditor] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);

  // El producto nuevo toma el próximo id, así la vista previa ya tiene el color que va a quedar
  const proximoId = productos.reduce((maximo, p) => Math.max(maximo, p.id), 0) + 1;

  const abrirNuevo = () => setEditor({ producto: null });

  const handleGuardar = async (datos) => {
    await guardar(datos, editor.producto?.id);
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
          Cargando productos...
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

    if (productos.length === 0) {
      return (
        <div className="admin-vacio">
          <span className="admin-vacio__texto">Todavía no hay productos. Agregá el primero.</span>
          <button
            className="admin-boton-cta admin-boton-cta--chico"
            type="button"
            onClick={abrirNuevo}
          >
            Agregar producto
          </button>
        </div>
      );
    }

    return (
      <ul className="admin-candys">
        {productos.map((producto) => (
          <CandyTarjeta
            key={producto.id}
            producto={producto}
            onEditar={(seleccionado) => setEditor({ producto: seleccionado })}
            onEliminar={setAEliminar}
          />
        ))}
      </ul>
    );
  };

  return (
    <section className="admin-seccion" aria-labelledby="admin-candy-titulo">
      <div className="admin-seccion__encabezado">
        <div className="admin-seccion__copy">
          <h1 id="admin-candy-titulo" className="admin-titulo">
            Candy
          </h1>
          {!cargando && !error && productos.length > 0 && (
            <span className="admin-seccion__subtitulo">
              {productos.length === 1 ? "1 producto" : `${productos.length} productos`}
            </span>
          )}
        </div>

        <button
          className="admin-boton-cta"
          type="button"
          onClick={abrirNuevo}
          disabled={cargando || Boolean(error)}
        >
          <PlusIcon />
          Agregar producto
        </button>
      </div>

      {renderContenido()}

      {editor && (
        <CandyFormModal
          producto={editor.producto}
          idColor={editor.producto?.id ?? proximoId}
          onGuardar={handleGuardar}
          onCerrar={() => setEditor(null)}
        />
      )}

      {aEliminar && (
        <ConfirmarEliminar
          titulo={`¿Eliminar “${aEliminar.nombre}”?`}
          texto="El producto deja de aparecer en el Candy."
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </section>
  );
}

export default AdminCandy;
