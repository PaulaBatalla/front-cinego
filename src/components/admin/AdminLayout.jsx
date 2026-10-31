import "../../styles/Admin.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotificaciones } from "../../hooks/useNotificaciones";
import LogoCineGo from "../LogoCineGo";
import { EyeIcon, LogoutIcon } from "../icons";

// Las demás secciones (Funciones, Salas, Promos, Candy) se suman a medida que se desarrollan
const SECCIONES = [{ ruta: "peliculas", nombre: "Películas" }];

function AdminLayout() {
  const { logout } = useAuth();
  const { notificar } = useNotificaciones();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    notificar("Cerraste sesión");
    navigate("/login");
  };

  return (
    <div className="admin">
      <header className="admin-header">
        <nav className="admin-header__barra" aria-label="Administración">
          <div className="admin-header__marca">
            <LogoCineGo />
            <span className="admin-header__badge">Administración</span>
          </div>

          <div className="admin-header__acciones">
            <button
              className="admin-boton-ghost"
              type="button"
              aria-label="Ver el sitio como cliente"
              onClick={() => navigate("/")}
            >
              <EyeIcon />
              <span className="admin-ocultar-sm">Ver sitio</span>
            </button>
            <button
              className="admin-boton-ghost"
              type="button"
              aria-label="Cerrar sesión"
              onClick={handleLogout}
            >
              <LogoutIcon />
              <span className="admin-ocultar-sm">Salir</span>
            </button>
          </div>
        </nav>

        <nav className="admin-tabs" aria-label="Secciones">
          {SECCIONES.map((seccion) => (
            <NavLink key={seccion.ruta} className="admin-tab" to={seccion.ruta}>
              {seccion.nombre}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="admin-contenido">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
