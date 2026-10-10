import { Route, Routes } from "react-router-dom";
import Peliculas from "./components/Peliculas";
import "./App.css";
import Header from "./components/Header";
import Candy from "./components/Candy";
import PeliculaFunciones from "./pages/PeliculaFunciones";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Peliculas />} />
        <Route path="/candy" element={<Candy />} />
        <Route path="/pelicula/:id" element={<PeliculaFunciones />} />
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Routes>
    </div>
  );
}

export default App;
