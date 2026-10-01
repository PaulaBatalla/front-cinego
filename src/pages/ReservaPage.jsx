import { useState } from "react";
import reservas from "../data/reservas.json";
import SelectorFuncion from "../components/SelectorFuncion";
import SelectorAsientos from "../components/SelectorAsientos";

function ReservaPage() {
  const [peliculaId, setPeliculaId] = useState(reservas[0].id);
  const [funcionSeleccionada, setFuncionSeleccionada] = useState(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);

  const peliculaSeleccionada = reservas.find(
    (pelicula) => pelicula.id === Number(peliculaId)
  );

  function cambiarPelicula(event) {
    setPeliculaId(event.target.value);
    setFuncionSeleccionada(null);
    setAsientosSeleccionados([]);
  }

  function seleccionarFuncion(funcion) {
    setFuncionSeleccionada(funcion);
    setAsientosSeleccionados([]);
  }

  function cambiarAsiento(asiento) {
    setAsientosSeleccionados((seleccionados) =>
      seleccionados.includes(asiento)
        ? seleccionados.filter((item) => item !== asiento)
        : [...seleccionados, asiento]
    );
  }

  const total = peliculaSeleccionada.precio * asientosSeleccionados.length;

  return (
    <main className="reserva-page">
      <h1>Reservar entradas</h1>

      <label htmlFor="pelicula">Película</label>
      <select
        id="pelicula"
        value={peliculaId}
        onChange={cambiarPelicula}
      >
        {reservas.map((pelicula) => (
          <option key={pelicula.id} value={pelicula.id}>
            {pelicula.titulo}
          </option>
        ))}
      </select>

      <SelectorFuncion
        funciones={peliculaSeleccionada.funciones}
        funcionSeleccionada={funcionSeleccionada}
        onSeleccionar={seleccionarFuncion}
      />

      {funcionSeleccionada && (
        <SelectorAsientos
          asientos={funcionSeleccionada.asientos}
          asientosOcupados={funcionSeleccionada.asientosOcupados}
          asientosSeleccionados={asientosSeleccionados}
          onCambiarAsiento={cambiarAsiento}
        />
      )}

      <section className="resumen">
        <h2>Resumen</h2>
        <p>Película: {peliculaSeleccionada.titulo}</p>
        <p>
          Función:{" "}
          {funcionSeleccionada
            ? `${funcionSeleccionada.fecha} — ${funcionSeleccionada.hora}`
            : "Todavía no elegida"}
        </p>
        <p>
          Asientos:{" "}
          {asientosSeleccionados.length > 0
            ? asientosSeleccionados.join(", ")
            : "Todavía no elegidos"}
        </p>
        <p>Precio por entrada: ${peliculaSeleccionada.precio}</p>
        <p>Total: ${total}</p>
      </section>
    </main>
  );
}

export default ReservaPage;