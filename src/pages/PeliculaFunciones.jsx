import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResumenFuncion from "../components/funciones/ResumenFuncion";
import SalaHorarios from "../components/funciones/SalaHorarios";
import SelectorDia from "../components/funciones/SelectorDia";
import "./PeliculaFunciones.css";

const API_URL = "http://localhost:8080/api";

// Configuración del cine para las butacas: 6 filas x 8 columnas
const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;

function getOcupadasGuardadas(funcionId) {
  try {
    const datos = localStorage.getItem(`butacas_funcion_${funcionId}`);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

function guardarOcupadas(funcionId, ocupadas) {
  localStorage.setItem(`butacas_funcion_${funcionId}`, JSON.stringify(ocupadas));
}

function generarButacas(ocupadas) {
  return FILAS.flatMap((fila) =>
    Array.from({ length: COLUMNAS }, (_, i) => {
      const id = `${fila}${i + 1}`;
      return {
        id,
        fila,
        numero: i + 1,
        estado: ocupadas.includes(id) ? "ocupada" : "libre",
      };
    })
  );
}

function adaptarFuncion(f) {
  return {
    id: f.id,
    fecha: f.horarioInicio.slice(0, 10),
    hora: f.horarioInicio.slice(11, 16),
    sala: f.salaNombre,
    precio: Number(f.precio),
  };
}

// Página /pelicula/:id → se llega desde "Ver funciones" en la cartelera.
function PeliculaFunciones() {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState(null);
  const [funciones, setFunciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Pedimos la película y todas las funciones al mismo tiempo.
        const [respuestaPelicula, respuestaFunciones] = await Promise.all([
          fetch(`${API_URL}/peliculas/${id}`),
          fetch(`${API_URL}/funciones`),
        ]);

        if (respuestaPelicula.status === 404) {
          setPelicula(null);
          return;
        }

        if (!respuestaPelicula.ok || !respuestaFunciones.ok) {
          throw new Error("No se pudieron cargar las funciones");
        }

        const datosPelicula = await respuestaPelicula.json();
        const datosFunciones = await respuestaFunciones.json();

        setPelicula(datosPelicula);
        setFunciones(
          datosFunciones
            .filter((f) => f.peliculaId === datosPelicula.id)
            .map(adaptarFuncion),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id]);

  if (cargando) return <p>Cargando funciones...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!pelicula) {
    return (
      <main className="funciones-pagina">
        <p>No encontramos esa película.</p>
        <Link to="/">Volver a la cartelera</Link>
      </main>
    );
  }

  // key: si se pasa de una película a otra, el selector arranca de cero.
  return <SeleccionFuncion key={pelicula.id} pelicula={pelicula} funciones={funciones} />;
}

function SeleccionFuncion({ pelicula, funciones }) {
  // Ordenadas por día y hora.
  const ordenadas = [...funciones].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

  // Los días que tienen funciones, sin repetir.
  const dias = ordenadas.map((f) => f.fecha).filter((fecha, i, lista) => lista.indexOf(fecha) === i);

  const [diaElegido, setDiaElegido] = useState(dias.length > 0 ? dias[0] : null);
  const [funcionElegida, setFuncionElegida] = useState(null);

  // Estados para el selector de butacas integrado
  const [ocupadas, setOcupadas] = useState([]);
  const [butacas, setButacas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);

  // Actualizar butacas cuando cambia la función elegida
  useEffect(() => {
    if (funcionElegida) {
      const guardadas = getOcupadasGuardadas(funcionElegida.id);
      setOcupadas(guardadas);
      setButacas(generarButacas(guardadas));
      setSeleccionadas([]);
    } else {
      setOcupadas([]);
      setButacas([]);
      setSeleccionadas([]);
    }
  }, [funcionElegida]);

  // Las funciones del día elegido, agrupadas por sala.
  const funcionesDelDia = ordenadas.filter((f) => f.fecha === diaElegido);
  const salas = funcionesDelDia.map((f) => f.sala).filter((sala, i, lista) => lista.indexOf(sala) === i);

  function elegirDia(dia) {
    setDiaElegido(dia);
    setFuncionElegida(null); // al cambiar de día, se borra el horario elegido
  }

  const precioUnitario = funcionElegida?.precio || pelicula?.precio || 3500;
  const total = seleccionadas.length * precioUnitario;

  const toggleButaca = (butaca) => {
    if (butaca.estado === "ocupada") return;
    setSeleccionadas((prev) =>
      prev.includes(butaca.id)
        ? prev.filter((b) => b !== butaca.id)
        : [...prev, butaca.id]
    );
  };

  const handleConfirmar = () => {
    if (seleccionadas.length === 0 || !funcionElegida) return;

    const nuevasOcupadas = [...ocupadas, ...seleccionadas];
    guardarOcupadas(funcionElegida.id, nuevasOcupadas);

    setOcupadas(nuevasOcupadas);
    setButacas(generarButacas(nuevasOcupadas));
    setSeleccionadas([]);

    alert(
      `¡Compra confirmada!\n\nPelícula: ${pelicula?.titulo || "Película"}\nFunción: ${funcionElegida.fecha} ${funcionElegida.hora} (Sala ${funcionElegida.sala})\nButacas: ${seleccionadas.join(", ")}\nTotal: $${total.toLocaleString("es-AR")}\n\nLas butacas quedaron registradas.`
    );
  };

  const handleLimpiar = () => {
    if (!funcionElegida) return;
    if (!confirm("¿Deseás reiniciar todas las butacas de esta función a libres?")) return;
    guardarOcupadas(funcionElegida.id, []);
    setOcupadas([]);
    setButacas(generarButacas([]));
    setSeleccionadas([]);
  };

  return (
    <main className="funciones-pagina">
      <Link className="volver" to="/">
        {" "}
        ← Volver a la cartelera{" "}
      </Link>

      <section className="pelicula-detalle">
        <img className="pelicula-detalle-poster" src={pelicula.posterUrl} alt={`Póster de ${pelicula.titulo}`} />
        <div>
          <h1>{pelicula.titulo}</h1>
          <div className="etiquetas">
            <span className="etiqueta" title="Clasificación por edad">
              +{pelicula.clasificacion}
            </span>
            <span className="etiqueta">{pelicula.duracion}</span>
          </div>
          <h2 className="selector-titulo">Sinopsis</h2>
          <p className="sinopsis">{pelicula.sinopsis}</p>
        </div>
      </section>

      <div className="funciones-layout">
        <section className="funciones-selector">
          {dias.length === 0 ? (
            <p className="sin-funciones">Por ahora no hay funciones programadas para esta película.</p>
          ) : (
            <>
              <SelectorDia dias={dias} diaElegido={diaElegido} onElegir={elegirDia} />
              <div className="selector-bloque">
                <h3 className="selector-titulo">Sala y horario</h3>
                {salas.map((sala) => {
                  const funcionesDeLaSala = funcionesDelDia.filter((f) => f.sala === sala);
                  return (
                    <SalaHorarios
                      key={sala}
                      sala={sala}
                      precio={funcionesDeLaSala[0].precio}
                      funciones={funcionesDeLaSala}
                      funcionElegida={funcionElegida}
                      onElegir={setFuncionElegida}
                    />
                  );
                })}
              </div>
            </>
          )}
        </section>

        <ResumenFuncion titulo={pelicula.titulo} funcion={funcionElegida}>
          {/* Muestra los datos seleccionados hasta el momento */}
          <button type="button" className="boton-continuar" disabled={funcionElegida === null || seleccionadas.length === 0} onClick={handleConfirmar}>
            {funcionElegida ? (seleccionadas.length > 0 ? `Confirmar (${seleccionadas.length})` : "Elegí tus butacas") : "Elegí un horario"}
          </button>
        </ResumenFuncion>
      </div>

      {/* Selector de Asientos colocado debajo del todo, después de elegir el horario */}
      {funcionElegida && (
        <section className="butacas-container" style={{ marginTop: "40px" }}>
          <div className="butacas-header">
            <h2>Selección de Asientos</h2>
            <p className="butacas-subtitulo">
              Función: {funcionElegida.fecha} a las {funcionElegida.hora} (Sala {funcionElegida.sala})
            </p>
          </div>

          {/* Pantalla 3D */}
          <div className="pantalla-wrapper">
            <div className="pantalla">
              <span>PANTALLA</span>
            </div>
          </div>

          {/* Grilla de butacas */}
          <div className="grilla">
            {FILAS.map((fila) => (
              <div key={fila} className="fila">
                <span className="fila-label">{fila}</span>
                <div className="fila-butacas">
                  {butacas
                    .filter((b) => b.fila === fila)
                    .map((butaca) => {
                      const estaSeleccionada = seleccionadas.includes(butaca.id);
                      return (
                        <button
                          key={butaca.id}
                          className={`butaca ${butaca.estado} ${
                            estaSeleccionada ? "seleccionada" : ""
                          }`}
                          onClick={() => toggleButaca(butaca)}
                          title={`Butaca ${butaca.id}${
                            butaca.estado === "ocupada" ? " (ocupada)" : ""
                          }`}
                          disabled={butaca.estado === "ocupada"}
                        >
                          {butaca.numero}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="leyenda">
            <span className="leyenda-item">
              <span className="dot libre"></span>Libre
            </span>
            <span className="leyenda-item">
              <span className="dot seleccionada"></span>Seleccionada
            </span>
            <span className="leyenda-item">
              <span className="dot ocupada"></span>Ocupada
            </span>
          </div>

          {/* Resumen y confirmación */}
          <div className="resumen">
            <p className="resumen-p">
              {seleccionadas.length > 0
                ? `Butacas: ${seleccionadas.join(", ")}`
                : "Ninguna butaca seleccionada"}
            </p>
            <p className="resumen-total">
              Total: <strong>${total.toLocaleString("es-AR")}</strong>
            </p>
            <button
              className="btn-confirmar"
              onClick={handleConfirmar}
              disabled={seleccionadas.length === 0}
            >
              Confirmar compra ({seleccionadas.length})
            </button>
            {ocupadas.length > 0 && (
              <button className="btn-limpiar" onClick={handleLimpiar}>
                Reiniciar sala
              </button>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default PeliculaFunciones;