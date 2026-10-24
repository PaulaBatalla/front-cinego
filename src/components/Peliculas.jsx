import { useEffect, useState, useMemo } from "react";
import "../styles/Peliculas.css";
import PeliculasFallback from "./PeliculasFallback";
import PeliculasList from "./PeliculasList";
import PeliculasFiltros from "./PeliculasFiltros";
import { SearchIcon } from "./icons";
import { normalizarBusquedaRegex } from "../utils/busquedaRegex";

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
  const [diaSeleccionado, setDiaSeleccionado] = useState("todos");
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("todos");
  const [formatoSeleccionado, setFormatoSeleccionado] = useState("todos");

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
    setDiaSeleccionado("todos");
    setIdiomaSeleccionado("todos");
    setFormatoSeleccionado("todos");
  };

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    diaSeleccionado !== "todos" ||
    idiomaSeleccionado !== "todos" ||
    formatoSeleccionado !== "todos";

  // Aplicación combinada de filtros
  const peliculasFiltradas = useMemo(() => {
    const regex = busqueda.trim() ? normalizarBusquedaRegex(busqueda) : null;

    return peliculas.filter((pelicula) => {
      // 1. Filtro por buscador (título)
      if (regex && (!pelicula.titulo || !regex.test(pelicula.titulo))) {
        return false;
      }

      // 2. Filtro por día
      if (diaSeleccionado !== "todos") {
        const tieneFuncionEnDia =
          pelicula.fechasFunciones &&
          pelicula.fechasFunciones.includes(diaSeleccionado);

        // Si la película tiene funciones asignadas, debe coincidir con el día
        if (pelicula.fechasFunciones?.length > 0 && !tieneFuncionEnDia) {
          return false;
        }
      }

      // 3. Filtro por idioma (sub o castellano)
      if (idiomaSeleccionado !== "todos") {
        if (!pelicula.idiomas?.includes(idiomaSeleccionado)) {
          return false;
        }
      }

      // 4. Filtro por formato (2D, 3D, premium)
      if (formatoSeleccionado !== "todos") {
        if (!pelicula.formatos?.includes(formatoSeleccionado)) {
          return false;
        }
      }

      return true;
    });
  }, [peliculas, busqueda, diaSeleccionado, idiomaSeleccionado, formatoSeleccionado]);

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
        diaSeleccionado={diaSeleccionado}
        onSeleccionarDia={setDiaSeleccionado}
        idiomaSeleccionado={idiomaSeleccionado}
        onSeleccionarIdioma={setIdiomaSeleccionado}
        formatoSeleccionado={formatoSeleccionado}
        onSeleccionarFormato={setFormatoSeleccionado}
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
