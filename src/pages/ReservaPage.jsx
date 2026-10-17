import { useState } from "react";
import { Link } from "react-router-dom";
import reservas from "../data/reservas.json";
import SelectorFuncion from "../components/SelectorFuncion";
import SelectorAsientos from "../components/SelectorAsientos";
import ResumenReserva from "../components/ResumenReserva";
import "../styles/reserva.css";

function ReservaPage() {
  const [peliculaId, setPeliculaId] = useState(reservas[0].id);
  const [funcionSeleccionada, setFuncionSeleccionada] = useState(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const pelicula = reservas.find((item) => item.id === Number(peliculaId));

  function cambiarPelicula(event) {
    setPeliculaId(event.target.value);
    setFuncionSeleccionada(null);
    setAsientosSeleccionados([]);
  }

  function seleccionarFuncion(funcion) {
    if (funcion?.id === funcionSeleccionada?.id) return;
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

  return (
    <main className="reserva-page">
      <Link className="reserva-volver" to="/">← Volver a la cartelera</Link>
      <header className="reserva-ficha">
        {pelicula.posterUrl ? (
          <img className="reserva-poster" src={pelicula.posterUrl} alt={`Póster de ${pelicula.titulo}`} />
        ) : (
          <div className="reserva-poster reserva-poster--alternativo" aria-hidden="true">
            <span>CINEGO · EN CARTELERA</span><strong>{pelicula.titulo}</strong>
          </div>
        )}
        <div className="reserva-ficha-info">
          <h1>{pelicula.titulo}</h1>
          {pelicula.sinopsis && <p>{pelicula.sinopsis}</p>}
          <label htmlFor="pelicula">Elegí tu película</label>
          <select id="pelicula" value={peliculaId} onChange={cambiarPelicula}>
            {reservas.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}
          </select>
        </div>
      </header>

      <div className="reserva-layout">
        <div className="reserva-panel reserva-seleccion">
          <ol className="reserva-pasos" aria-label="Progreso de la reserva">
            <li className={funcionSeleccionada ? "reserva-paso-completo" : "reserva-paso-actual"} aria-current={!funcionSeleccionada ? "step" : undefined}>
              <span>{funcionSeleccionada ? "✓" : "1"}</span> Función
            </li>
            <li className={funcionSeleccionada ? "reserva-paso-actual" : ""} aria-current={funcionSeleccionada ? "step" : undefined}><span>2</span> Asientos</li>
          </ol>
          <SelectorFuncion key={pelicula.id} funciones={pelicula.funciones} precio={pelicula.precio} funcionSeleccionada={funcionSeleccionada} onSeleccionar={seleccionarFuncion} />
          {funcionSeleccionada ? (
            <SelectorAsientos
              asientos={funcionSeleccionada.asientos}
              asientosOcupados={funcionSeleccionada.asientosOcupados}
              asientosSeleccionados={asientosSeleccionados}
              onCambiarAsiento={cambiarAsiento}
            />
          ) : (
            <section className="reserva-espera"><h2>Asientos</h2><p>Elegí una función para ver las butacas disponibles.</p></section>
          )}
        </div>
        <ResumenReserva pelicula={pelicula} funcion={funcionSeleccionada} asientos={asientosSeleccionados} total={pelicula.precio * asientosSeleccionados.length} />
      </div>
    </main>
  );
}

export default ReservaPage;
