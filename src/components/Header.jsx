import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Header() {
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="site-header" id="inicio">
      <Link className="site-brand" to="/">CineGo</Link>
      <nav className="site-nav" aria-label="Navegación principal">
        <Link to="/">Peliculas</Link>
        <Link to="/candy">Candy</Link>
      </nav>
      {isAuthenticated ? (
        <div className="site-session">
          <span>{usuario.email}</span>
          <button className="site-login" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <Link className="site-login" to="/login">Ingresar</Link>
      )}
    </header>
  );
}
export default Header;
