import ReservaPage from "./pages/ReservaPage";
import { Route, Routes } from "react-router-dom";
import Peliculas from "./components/Peliculas";
import Login from "./components/Login";
import Registro from "./components/Registro";
import RutaInvitado from "./components/RutaInvitado";
import "./App.css";
import Header from "./components/Header";
import Candy from "./components/Candy";
import PeliculaFunciones from "./pages/PeliculaFunciones";
import PeliculaDetalle from "./pages/PeliculaDetalle";
import SeleccionButacas from "./pages/SeleccionButacas";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Peliculas />} />
        <Route path="/candy" element={<Candy />} />
        <Route path="/reservas" element={<ReservaPage />} />
        <Route path="/pelicula/:id" element={<PeliculaFunciones />} />
        <Route path="/detalle/:id" element={<PeliculaDetalle />} />
        <Route path="/detalle/:id/butacas" element={<SeleccionButacas />} />
        <Route element={<RutaInvitado />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Route>
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </div>
  );
}

export default App;
