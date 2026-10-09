import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PeliculaDetalle from "./pages/PeliculaDetalle";
import SeleccionButacas from "./pages/SeleccionButacas";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pelicula/:id" element={<PeliculaDetalle />} />
      <Route path="/pelicula/:id/butacas" element={<SeleccionButacas />} />
    </Routes>
  );
}

export default App;