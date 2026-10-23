import { useState } from "react";

function SelectorFuncion({ funciones, precio, funcionSeleccionada, onSeleccionar }) {
  const dias = [...new Set(funciones.map((funcion) => funcion.fecha))].sort();
  const [dia, setDia] = useState(funcionSeleccionada?.fecha ?? dias[0]);
  const funcionesDelDia = funciones.filter((funcion) => funcion.fecha === dia);
  const salas = [...new Set(funcionesDelDia.map((funcion) => funcion.sala))];

  function elegirDia(fecha) {
    if (fecha === dia) return;
    setDia(fecha);
    onSeleccionar(null);
  }

  return (
    <section className="reserva-funciones" aria-label="Funciones disponibles">
      <h2>Día</h2>
      <div className="reserva-dias">
        {dias.map((fecha) => {
          const valor = new Date(`${fecha}T12:00:00`);
          return (
            <button key={fecha} type="button" className={`reserva-dia ${dia === fecha ? "reserva-dia--activo" : ""}`} aria-pressed={dia === fecha} onClick={() => elegirDia(fecha)}>
              <span>{valor.toLocaleDateString("es-AR", { weekday: "short" })}</span>
              <strong>{valor.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</strong>
            </button>
          );
        })}
      </div>
      <h2>Sala y horario</h2>
      <div className="reserva-salas">
        {salas.map((sala) => (
          <div className="reserva-sala-horarios" key={sala}>
            <div><strong>Sala {sala}</strong><small>${Number(funcionesDelDia.find((f) => f.sala === sala)?.precio ?? precio ?? 0).toLocaleString("es-AR")} por entrada</small></div>
            <div className="funciones-lista">
              {funcionesDelDia.filter((funcion) => funcion.sala === sala).map((funcion) => (
                <button key={funcion.id} type="button" aria-pressed={funcionSeleccionada?.id === funcion.id} className={`funcion-boton ${funcionSeleccionada?.id === funcion.id ? "funcion-boton--seleccionada" : ""}`} onClick={() => onSeleccionar(funcion)}>{funcion.hora}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!dias.length && <p>No hay funciones disponibles.</p>}
    </section>
  );
}

export default SelectorFuncion;
