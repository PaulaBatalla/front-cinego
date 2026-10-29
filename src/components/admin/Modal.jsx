import { useEffect, useRef } from "react";

const ENFOCABLES =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// Ventana del panel: se cierra con Escape o tocando afuera, y mantiene el foco adentro
function Modal({
  tituloId,
  descripcionId,
  rol = "dialog",
  className = "",
  onCerrar,
  children,
}) {
  const panelRef = useRef(null);

  // Al abrir: foco en el primer campo y la página de atrás no scrollea.
  // Al cerrar: el foco vuelve al botón que abrió el modal.
  useEffect(() => {
    const anterior = document.activeElement;
    const panel = panelRef.current;
    const inicial =
      panel.querySelector("[data-autofocus]") || panel.querySelector(ENFOCABLES);
    inicial?.focus();

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
      anterior?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCerrar();
        return;
      }

      if (event.key !== "Tab") return;

      const enfocables = [...panelRef.current.querySelectorAll(ENFOCABLES)];
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];

      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  return (
    <div
      className="admin-modal-fondo"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <div
        ref={panelRef}
        className={`admin-modal ${className}`.trim()}
        role={rol}
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descripcionId}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
