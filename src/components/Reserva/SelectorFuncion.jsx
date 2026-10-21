function SelectorFuncion({ funciones, funcionSeleccionada, onSeleccionar }) {
  return (
    <section>
      <h2>Elegí una función</h2>

      <div className="funciones-lista">
        {funciones.map((funcion) => (
          <button
            key={funcion.id}
            type="button"
            className={
              funcionSeleccionada?.id === funcion.id
                ? "funcion-boton funcion-boton--seleccionada"
                : "funcion-boton"
            }
            onClick={() => onSeleccionar(funcion)}
          >
            <span>{funcion.fecha}</span>
            <strong>{funcion.hora}</strong>
            <span>Sala {funcion.sala}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default SelectorFuncion;