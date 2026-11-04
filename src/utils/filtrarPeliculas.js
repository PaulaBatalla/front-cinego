import { normalizarBusquedaRegex } from "./busquedaRegex";

export function filtrarPeliculas(peliculas, busqueda, filtros) {
  const regex = busqueda.trim() ? normalizarBusquedaRegex(busqueda) : null;

  return peliculas.filter((pelicula) => {
    if (regex && (!pelicula.titulo || !regex.test(pelicula.titulo))) {
      return false;
    }

    if (filtros.dia !== "todos") {
      const tieneFuncionEnDia = pelicula.fechasFunciones?.includes(filtros.dia);

      // Si la película tiene funciones asignadas, debe coincidir con el día.
      if (pelicula.fechasFunciones?.length > 0 && !tieneFuncionEnDia) {
        return false;
      }
    }

    if (filtros.idioma !== "todos" && !pelicula.idiomas?.includes(filtros.idioma)) {
      return false;
    }

    if (filtros.formato !== "todos" && !pelicula.formatos?.includes(filtros.formato)) {
      return false;
    }

    return true;
  });
}
