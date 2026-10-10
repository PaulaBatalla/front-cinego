import { useState } from "react";
import MovieItems from "../data/peliculas.json";

export function usePeliculas() {
  const [peliculas] = useState(MovieItems);
  return { peliculas };
}