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

function App() {
  return (
    <div className="App">
      <Header />
      <main className="App-main">
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
      </main>
    </div>
  );
}

export default App;
