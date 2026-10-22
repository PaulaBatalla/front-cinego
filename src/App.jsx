import ReservaPage from "./pages/ReservaPage";
import { Route, Routes } from "react-router-dom";
import Peliculas from "./components/Peliculas/Peliculas";
import Login from "./components/Auth/Login";
import Registro from "./components/Auth/Registro";
import RutaInvitado from "./components/RutaInvitado";
import "./App.css";
import Header from "./components/Header";
import Candy from "./components/Candy/Candy";
import PeliculaFunciones from "./pages/PeliculaFuncionesPages";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Peliculas />} />
        <Route path="/candy" element={<Candy />} />
        <Route path="/reservas" element={<ReservaPage />} />
        <Route path="/pelicula/:id" element={<PeliculaFunciones />} />
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
