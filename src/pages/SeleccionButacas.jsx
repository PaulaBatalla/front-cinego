import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import peliculas from "../data/peliculas.json";
import "./SeleccionButacas.css";

// Configuración del cine: 6 filas x 8 columnas
const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;

// Lee las butacas ocupadas desde localStorage para una película concreta
function getOcupadasGuardadas(peliculaId) {
  try {
    const datos = localStorage.getItem(`butacas_pelicula_${peliculaId}`);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

// Guarda las butacas ocupadas en localStorage
function guardarOcupadas(peliculaId, ocupadas) {
  localStorage.setItem(`butacas_pelicula_${peliculaId}`, JSON.stringify(ocupadas));
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

function SeleccionButacas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pelicula = peliculas.find((p) => p.id === Number(id));

  const [ocupadas, setOcupadas] = useState(() => getOcupadasGuardadas(id));
  const [butacas, setButacas] = useState(() => generarButacas(getOcupadasGuardadas(id)));
  const [seleccionadas, setSeleccionadas] = useState([]);

  if (!pelicula) {
    return (
      <div className="butacas-container">
        <h2>Pelicula no encontrada</h2>
        <Link to="/" className="btn-volver">Volver al catalogo</Link>
      </div>
    );
  }

  const toggleButaca = (butaca) => {
    if (butaca.estado === "ocupada") return;
    setSeleccionadas((prev) =>
      prev.includes(butaca.id)
        ? prev.filter((b) => b !== butaca.id)
        : [...prev, butaca.id]
    );
  };

  const total = seleccionadas.length * pelicula.precio;

  const handleConfirmar = () => {
    if (seleccionadas.length === 0) return;

    // Unir las ya ocupadas con las nuevas seleccionadas
    const nuevasOcupadas = [...ocupadas, ...seleccionadas];

    // Guardar en localStorage
    guardarOcupadas(id, nuevasOcupadas);

    // Actualizar el estado local para que se vean como ocupadas
    setOcupadas(nuevasOcupadas);
    setButacas(generarButacas(nuevasOcupadas));
    setSeleccionadas([]);

    alert(
      `Compra confirmada!\n\nPelicula: ${pelicula.titulo}\nButacas: ${seleccionadas.join(", ")}\nTotal: $${total.toLocaleString("es-AR")}\n\nLas butacas quedaron guardadas.`
    );
  };

  const handleLimpiar = () => {
    if (!confirm("Reiniciar todas las butacas a libre?")) return;
    guardarOcupadas(id, []);
    setOcupadas([]);
    setButacas(generarButacas([]));
    setSeleccionadas([]);
  };

  return (
    <div className="butacas-container">
      <Link to={`/pelicula/${id}`} className="btn-volver">Volver al detalle</Link>

      <div className="butacas-header">
        <h2>{pelicula.titulo}</h2>
        <p className="butacas-subtitulo">Selecciona tus butacas</p>
      </div>

      {/* Pantalla */}
      <div className="pantalla-wrapper">
        <div className="pantalla">PANTALLA</div>
      </div>

      {/* Grilla de butacas */}
      <div className="grilla">
        {FILAS.map((fila) => (
          <div key={fila} className="fila">
            <span className="fila-label">{fila}</span>
            {butacas
              .filter((b) => b.fila === fila)
              .map((butaca) => {
                const estaSeleccionada = seleccionadas.includes(butaca.id);
                return (
                  <button
                    key={butaca.id}
                    className={`butaca ${butaca.estado} ${estaSeleccionada ? "seleccionada" : ""}`}
                    onClick={() => toggleButaca(butaca)}
                    title={`Butaca ${butaca.id}${butaca.estado === "ocupada" ? " (ocupada)" : ""}`}
                    disabled={butaca.estado === "ocupada"}
                  >
                    {butaca.numero}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="leyenda">
        <span className="leyenda-item"><span className="dot libre"></span>Libre</span>
        <span className="leyenda-item"><span className="dot seleccionada"></span>Seleccionada</span>
        <span className="leyenda-item"><span className="dot ocupada"></span>Ocupada</span>
      </div>

      {/* Resumen y confirmacion */}
      <div className="resumen">
        <p>
          {seleccionadas.length > 0
            ? `Butacas: ${seleccionadas.join(", ")}`
            : "Ninguna butaca seleccionada"}
        </p>
        <p className="resumen-total">Total: <strong>${total.toLocaleString("es-AR")}</strong></p>
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
    </div>
  );
}

export default SeleccionButacas;
