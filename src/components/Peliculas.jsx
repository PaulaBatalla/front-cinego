import { useEffect, useState, useMemo, useRef } from "react";
import "../styles/Peliculas.css";
import PeliculasFallback from "./PeliculasFallback";
import PeliculasList from "./PeliculasList";
import PeliculasFiltros from "./PeliculasFiltros";
import PromosEntradas from "./promos/PromosEntradas";
import { SearchIcon } from "./icons";
import { solicitar } from "../services/api";
import { filtrarPeliculas } from "../utils/filtrarPeliculas";

const FILTROS_INICIALES = {
  dia: "todos",
  idioma: "todos",
  formato: "todos",
  genero: "todos",
};

const GENEROS_BASE = [
  "Acción",
  "Animación",
  "Aventura",
  "Ciencia Ficción",
  "Comedia",
  "Crimen",
  "Drama",
  "Fantasía",
  "Historia",
];

// Metadatos complementarios para idiomas y formatos de cada película
const METADATOS_DEFAULT = {
  1: { idiomas: ["sub", "castellano"], formatos: ["2D"] }, // La odisea
  2: { idiomas: ["castellano", "sub"], formatos: ["2D", "3D", "premium"] }, // Spiderman
  3: { idiomas: ["sub"], formatos: ["2D", "3D", "premium"] }, // Dune: Part 3
  4: { idiomas: ["castellano"], formatos: ["2D"] },
};

function Peliculas() {
  const [peliculasCrudas, setPeliculasCrudas] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [generosDisponibles, setGenerosDisponibles] = useState(GENEROS_BASE);
  const [cargando, setCargando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const busquedaAnteriorRef = useRef("");
  const cargaInicialCompletaRef = useRef(false);

  const actualizarFiltro = (nombre, valor) => {
    setFiltros((anteriores) => ({ ...anteriores, [nombre]: valor }));
  };

  useEffect(() => {
    const controlador = new AbortController();
    solicitar("/funciones", { signal: controlador.signal })
      .then((datos) => setFunciones(datos ?? []))
      .catch(() => {
        if (!controlador.signal.aborted) setFunciones([]);
      });
    return () => controlador.abort();
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    const cambioBusqueda = busqueda !== busquedaAnteriorRef.current;
    busquedaAnteriorRef.current = busqueda;
    const delay =
      cargaInicialCompletaRef.current && cambioBusqueda && busqueda.trim() !== ""
        ? 200
        : 0;

    const timer = setTimeout(async () => {
      if (cargaInicialCompletaRef.current) {
        setBuscando(true);
      }

      try {
        const params = new URLSearchParams();
        if (busqueda.trim()) params.set("titulo", busqueda.trim());
        if (filtros.genero !== "todos") params.set("genero", filtros.genero);
        const query = params.toString();
        const ruta = query ? `/peliculas?${query}` : "/peliculas";

        const datosPeliculas = await solicitar(ruta, { signal: controlador.signal });
        const lista = datosPeliculas ?? [];
        setPeliculasCrudas(lista);
        setError(null);

        if (!query) {
          const encontrados = new Set();
          lista.forEach((peli) => {
            if (peli.genero) {
              peli.genero
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean)
                .forEach((g) => encontrados.add(g));
            }
          });
          if (encontrados.size > 0) {
            setGenerosDisponibles(
              Array.from(encontrados).sort((a, b) => a.localeCompare(b, "es"))
            );
          }
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controlador.signal.aborted) {
          cargaInicialCompletaRef.current = true;
          setCargando(false);
          setBuscando(false);
        }
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controlador.abort();
    };
  }, [busqueda, filtros.genero]);

  // Enriquecer cada película con metadatos de funciones, idiomas y formatos
  const peliculas = useMemo(() => {
    return peliculasCrudas.map((peli) => {
      const funcionesPeli = funciones.filter((f) => f.peliculaId === peli.id);
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
  }, [peliculasCrudas, funciones]);

  // Función para resetear todos los filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltros(FILTROS_INICIALES);
  };

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    Object.values(filtros).some((filtro) => filtro !== "todos");

  // El filtrado por título (LIKE) y género se realiza en el backend vía GET /api/peliculas;
  // aquí aplicamos los filtros locales de día, idioma y formato.
  const peliculasFiltradas = useMemo(
    () => filtrarPeliculas(peliculas, "", { ...filtros, genero: "todos" }),
    [peliculas, filtros]
  );

  if (cargando) return <p className="listado-status">Cargando películas...</p>;
  if (error && !hayFiltrosActivos && peliculasCrudas.length === 0) {
    return <p className="listado-status">Error: {error}</p>;
  }

  return (
    <div className="listado-container" aria-busy={buscando}>
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

      {/* Barra de Filtros compacta: Días + Género + Formato + Idioma */}
      <PeliculasFiltros
        diaSeleccionado={filtros.dia}
        onSeleccionarDia={(valor) => actualizarFiltro("dia", valor)}
        idiomaSeleccionado={filtros.idioma}
        onSeleccionarIdioma={(valor) => actualizarFiltro("idioma", valor)}
        formatoSeleccionado={filtros.formato}
        onSeleccionarFormato={(valor) => actualizarFiltro("formato", valor)}
        generoSeleccionado={filtros.genero}
        onSeleccionarGenero={(valor) => actualizarFiltro("genero", valor)}
        generosDisponibles={generosDisponibles}
        onLimpiarFiltros={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
        totalResultados={peliculasFiltradas.length}
      />

      {error && (
        <p className="listado-status" role="alert">
          Error: {error}
        </p>
      )}

      {/* Grilla de películas filtradas */}
      <PeliculasList
        fallback={<PeliculasFallback />}
        peliculas={peliculasFiltradas}
        totalOriginal={peliculas.length}
        hayFiltrosActivos={hayFiltrosActivos}
        onLimpiarFiltros={limpiarFiltros}
      />

      {/* Promos activas en entradas (si no hay, no se muestra nada) */}
      <PromosEntradas />
    </div>
  );
}

export default Peliculas;
