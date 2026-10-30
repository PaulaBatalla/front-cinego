import { useEffect, useState, useMemo } from "react";
import "../styles/Peliculas.css";
import PeliculasFallback from "./PeliculasFallback";
import PeliculasList from "./PeliculasList";
import PeliculasFiltros from "./PeliculasFiltros";
import { SearchIcon } from "./icons";
import { filtrarPeliculas } from "../utils/filtrarPeliculas";

const FILTROS_INICIALES = {
  dia: "todos",
  idioma: "todos",
  formato: "todos",
};

// Metadatos complementarios para idiomas y formatos de cada película
const METADATOS_DEFAULT = {
  1: { idiomas: ["sub", "castellano"], formatos: ["2D"] }, // La odisea
  2: { idiomas: ["castellano", "sub"], formatos: ["2D", "3D", "premium"] }, // Spiderman
  3: { idiomas: ["sub"], formatos: ["2D", "3D", "premium"] }, // Dune: Part 3
  4: { idiomas: ["castellano"], formatos: ["2D"] },
};

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  const actualizarFiltro = (nombre, valor) => {
    setFiltros((anteriores) => ({ ...anteriores, [nombre]: valor }));
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [respPeliculas, respFunciones] = await Promise.all([
          fetch("http://localhost:8080/api/peliculas", {
            headers: { Accept: "application/json" },
          }),
          fetch("http://localhost:8080/api/funciones", {
            headers: { Accept: "application/json" },
          }).catch(() => null),
        ]);

        if (!respPeliculas.ok) {
          throw new Error(`Error al cargar las películas (${respPeliculas.status})`);
        }

        const datosPeliculas = await respPeliculas.json();
        const datosFunciones =
          respFunciones && respFunciones.ok ? await respFunciones.json() : [];

        // Enriquecer cada película con metadatos de funciones, idiomas y formatos
        const peliculasEnriquecidas = datosPeliculas.map((peli) => {
          const funcionesPeli = datosFunciones.filter(
            (f) => f.peliculaId === peli.id
          );
          const meta = METADATOS_DEFAULT[peli.id] || {
            idiomas: ["sub", "castellano"],
            formatos: ["2D"],
          };

          // Extraer fechas con funciones para esta película
          const fechasConFunciones = funcionesPeli.map((f) =>
            f.horarioInicio ? f.horarioInicio.slice(0, 10) : ""
          );

          // Extraer formatos de sala de las funciones reales
          const formatosReales = new Set(meta.formatos);
          funcionesPeli.forEach((f) => {
            if (f.salaNombre?.toLowerCase().includes("3d")) formatosReales.add("3D");
            if (f.salaNombre?.toLowerCase().includes("premium")) formatosReales.add("premium");
          });

          return {
            ...peli,
            idiomas: meta.idiomas,
            formatos: Array.from(formatosReales),
            fechasFunciones: fechasConFunciones,
          };
        });

        setPeliculas(peliculasEnriquecidas);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para resetear todos los filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltros(FILTROS_INICIALES);
  };

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    Object.values(filtros).some((filtro) => filtro !== "todos");

  // Aplicación combinada de filtros
  const peliculasFiltradas = useMemo(
    () => filtrarPeliculas(peliculas, busqueda, filtros),
    [peliculas, busqueda, filtros]
  );

  if (cargando) return <p className="listado-status">Cargando películas...</p>;
  if (error) return <p className="listado-status">Error: {error}</p>;

  return (
    <div className="listado-container">
      {/* Encabezado con título y buscador */}
      <section className="listado-header">
        <div className="listado-header__copy">
          <h1 className="listado-header__title">En cartelera</h1>
          <p className="listado-header__subtitle">
            Explorá los estrenos y elegí tu función
          </p>
        </div>

        <label className="listado-search">
          <SearchIcon />
          <span className="visually-hidden">Buscar película</span>
          <input
            type="search"
            placeholder="Buscar película..."
            className="listado-search__input"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </label>
      </section>

      {/* Barra de Filtros compacta: Días + Idioma + Formato */}
      <PeliculasFiltros
        diaSeleccionado={filtros.dia}
        onSeleccionarDia={(valor) => actualizarFiltro("dia", valor)}
        idiomaSeleccionado={filtros.idioma}
        onSeleccionarIdioma={(valor) => actualizarFiltro("idioma", valor)}
        formatoSeleccionado={filtros.formato}
        onSeleccionarFormato={(valor) => actualizarFiltro("formato", valor)}
        onLimpiarFiltros={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
        totalResultados={peliculasFiltradas.length}
      />

      {/* Grilla de películas filtradas */}
      <PeliculasList
        fallback={<PeliculasFallback />}
        peliculas={peliculasFiltradas}
        totalOriginal={peliculas.length}
        hayFiltrosActivos={hayFiltrosActivos}
        onLimpiarFiltros={limpiarFiltros}
      />
    </div>
  );
}

export default Peliculas;
