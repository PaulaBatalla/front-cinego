
// Cuadro con lo que eligió el usuario. El botón para seguir llega por children.
function ResumenFuncion({ titulo, funcion, children }) {
  return (
    <aside className="resumen">
      <h3>Tu función</h3>
      <dl>
        <div>
          <dt>Película</dt>
          <dd>{titulo}</dd>
        </div>
        <div>
          <dt>Día</dt>
          <dd>{funcion ? funcion.fecha : "Sin elegir"}</dd>
        </div>
        <div>
          <dt>Sala</dt>
          <dd>{funcion ? `${funcion.sala} · ${funcion.formato}` : "Sin elegir"}</dd>
        </div>
        <div>
          <dt>Horario</dt>
          <dd>{funcion ? funcion.hora : "Sin elegir"}</dd>
        </div>
        <div>
          <dt>Precio por entrada</dt>
          <dd>{funcion ? `$${funcion.precio.toLocaleString("es-AR")}` : "—"}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}

export default ResumenFuncion;