import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import peliculasLocales from "../data/peliculas.json";
import { solicitar } from "../services/api";
import "./SeleccionButacas.css";

// Configuración del cine: 6 filas x 8 columnas
const FILAS = ["A", "B", "C", "D", "E", "F"];
const COLUMNAS = 8;

function getOcupadasGuardadas(peliculaId) {
  try {
    const datos = localStorage.getItem(`butacas_pelicula_${peliculaId}`);
    return datos ? JSON.parse(datos) : [];
  } catch {
    return [];
  }
}

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
  const [pelicula, setPelicula] = useState(() =>
    peliculasLocales.find((p) => String(p.id) === String(id)) || null
  );

  useEffect(() => {
    let activo = true;
    solicitar(`/peliculas/${id}`)
      .then((datos) => {
        if (activo) {
          setPelicula((prev) => ({
            ...datos,
            precio: prev?.precio || 3500,
          }));
        }
      })
      .catch(() => {
        // Fallback local ya seteado
      });
    return () => {
      activo = false;
    };
  }, [id]);

  const [ocupadas, setOcupadas] = useState(() => getOcupadasGuardadas(id));
  const [butacas, setButacas] = useState(() => generarButacas(getOcupadasGuardadas(id)));
  const [seleccionadas, setSeleccionadas] = useState([]);

  const precioUnitario = pelicula?.precio || 3500;
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
    if (seleccionadas.length === 0) return;

    const nuevasOcupadas = [...ocupadas, ...seleccionadas];
    guardarOcupadas(id, nuevasOcupadas);

    setOcupadas(nuevasOcupadas);
    setButacas(generarButacas(nuevasOcupadas));
    setSeleccionadas([]);

    alert(
      `¡Compra confirmada!\n\nPelícula: ${pelicula?.titulo || "Película"}\nButacas: ${seleccionadas.join(", ")}\nTotal: $${total.toLocaleString("es-AR")}\n\nLas butacas quedaron registradas.`
    );
  };

  const handleLimpiar = () => {
    if (!confirm("¿Deseás reiniciar todas las butacas a libres?")) return;
    guardarOcupadas(id, []);
    setOcupadas([]);
    setButacas(generarButacas([]));
    setSeleccionadas([]);
  };

  return (
    <div className="butacas-container">
      <Link to={`/detalle/${id}`} className="btn-volver">
        ← Volver al detalle
      </Link>

      <div className="butacas-header">
        <h2>{pelicula?.titulo || "Película"}</h2>
        <p className="butacas-subtitulo">Seleccioná tus butacas</p>
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
    </div>
  );
}

export default SeleccionButacas;
