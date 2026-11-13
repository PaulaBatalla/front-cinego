import ControlSesion from "./components/ControlSesion";
import ReservaPage from "./pages/ReservaPage";
import MisReservas from "./pages/MisReservas";
import Checkout from "./pages/Checkout";
import { Navigate, Route, Routes } from "react-router-dom";
import Peliculas from "./components/Peliculas";
import Login from "./components/Login";
import Registro from "./components/Registro";
import RutaInvitado from "./components/RutaInvitado";
import RutaAdmin from "./components/RutaAdmin";
import "./App.css";
import SitioLayout from "./components/SitioLayout";
import AdminLayout from "./components/admin/AdminLayout";
import Candy from "./components/Candy";
import PeliculaFunciones from "./pages/PeliculaFunciones";
import AdminPeliculas from "./pages/AdminPeliculas";
import AdminFunciones from "./pages/AdminFunciones";
import AdminSalas from "./pages/AdminSalas";
import AdminCandy from "./pages/AdminCandy";
import AdminPromos from "./pages/AdminPromos";
import Toasts from "./components/Toasts";

function App() {
  return (
    <div className="App">
      <ControlSesion>
      <Routes>
        <Route element={<SitioLayout />}>
          <Route path="/" element={<Peliculas />} />
          <Route path="/candy" element={<Candy />} />
          <Route path="/reservas" element={<ReservaPage />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/pelicula/:id" element={<PeliculaFunciones />} />
          <Route element={<RutaInvitado />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Route>
          <Route path="*" element={<h1>Página no encontrada</h1>} />
        </Route>

        <Route element={<RutaAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="peliculas" replace />} />
            <Route path="peliculas" element={<AdminPeliculas />} />
            <Route path="funciones" element={<AdminFunciones />} />
            <Route path="salas" element={<AdminSalas />} />
            <Route path="candy" element={<AdminCandy />} />
            <Route path="promos" element={<AdminPromos />} />
          </Route>
        </Route>
      </Routes>
      </ControlSesion>
      <Toasts />
    </div>
  );
}

export default App;
