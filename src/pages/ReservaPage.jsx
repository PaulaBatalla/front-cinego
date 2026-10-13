import { useRef, useState } from "react";
import reservas from "../data/reservas.json";
import SelectorFuncion from "../components/SelectorFuncion";
import SelectorAsientos from "../components/SelectorAsientos";
import { crearReserva } from "../services/reservas";

function ReservaPage() {
  const [peliculaId, setPeliculaId] = useState(reservas[0].id);
  const [funcionSeleccionada, setFuncionSeleccionada] = useState(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [errorReserva, setErrorReserva] = useState(null);
  const [reservaCreada, setReservaCreada] = useState(null);
  const envioEnCurso = useRef(false);

  function limpiarResultado() {
    setErrorReserva(null);
    setReservaCreada(null);
  }

  const peliculaSeleccionada = reservas.find(
    (pelicula) => pelicula.id === Number(peliculaId)
  );

  function cambiarPelicula(event) {
    limpiarResultado();
    setPeliculaId(event.target.value);
    setFuncionSeleccionada(null);
    setAsientosSeleccionados([]);
  }

  function seleccionarFuncion(funcion) {
    limpiarResultado();
    setFuncionSeleccionada(funcion);
    setAsientosSeleccionados([]);
  }

  function cambiarAsiento(asiento) {
    limpiarResultado();
    setAsientosSeleccionados((seleccionados) =>
      seleccionados.includes(asiento)
        ? seleccionados.filter((item) => item !== asiento)
        : [...seleccionados, asiento]
    );
  }

  const total = peliculaSeleccionada.precio * asientosSeleccionados.length;

  // Los datos de ejemplo no incluyen IDs de asientos del backend.
  // La integración de asientos debe aportar el mapa etiqueta -> ID real
  // y una función obtenida del backend (backendId).
  const asientoIds = asientosSeleccionados.map(
    (etiqueta) => funcionSeleccionada?.asientoIds?.[etiqueta]
  );
  const tieneIdsReales =
    Number.isSafeInteger(funcionSeleccionada?.backendId) &&
    funcionSeleccionada.backendId > 0 &&
    asientoIds.length > 0 &&
    asientoIds.every((id) => Number.isSafeInteger(id) && id > 0);

  async function confirmarReserva(event) {
    event.preventDefault();
    if (envioEnCurso.current || !tieneIdsReales || reservaCreada) return;
    envioEnCurso.current = true;
    setEnviando(true);
    limpiarResultado();
    try {
      const creada = await crearReserva({
        funcionId: funcionSeleccionada.backendId,
        asientoIds,
      });
      setReservaCreada(creada);
    } catch (error) {
      setErrorReserva(error.message);
    } finally {
      envioEnCurso.current = false;
      setEnviando(false);
    }
  }

  return (
    <main className="reserva-page">
      <h1>Reservar entradas</h1>

      <form onSubmit={confirmarReserva}>
      <fieldset disabled={enviando}>

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
        {funcionSeleccionada && asientosSeleccionados.length > 0 && !tieneIdsReales && (
          <p>Esta selección usa datos de ejemplo. La confirmación estará disponible cuando se carguen las funciones y los asientos reales.</p>
        )}
        <button type="submit" disabled={!tieneIdsReales || enviando || Boolean(reservaCreada)}>
          {enviando ? "Creando reserva..." : "Confirmar reserva"}
        </button>
      </section>
      </fieldset>
      </form>
      {errorReserva && <p role="alert">{errorReserva}</p>}
      {reservaCreada && (
        <section role="status">
          <h2>Reserva creada</h2>
          <p>Número: {reservaCreada.idReserva}</p>
          <p>Estado: {reservaCreada.estado}</p>
          <p>Total: ${reservaCreada.total}</p>
        </section>
      )}
    </main>
  );
}

export default ReservaPage;
