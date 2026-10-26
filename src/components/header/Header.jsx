import "../../styles/Header.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useMobileMenu from "../../hooks/useMobileMenu";
import LogoCineGo from "../LogoCineGo";
import { UserIcon } from "../icons";
import HamburgerMenu from "./hamburger-menu/HamburgerMenu";

function Header() {
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { menuOpen, drawerId, closeMenu, toggleMenu } = useMobileMenu();

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const renderAuthActions = () =>
    isAuthenticated ? (
      <div className="site-session">
        <span>{usuario.email}</span>
        <button className="site-login" type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    ) : (
      <Link className="site-login" to="/login" onClick={closeMenu}>
        <UserIcon />
        Ingresar
      </Link>
    );

  return (
    <header className="site-header" id="inicio">
      <div className="site-header__inner">
        <div className="site-header__left">
          <Link className="site-brand" to="/" aria-label="CineGo" onClick={closeMenu}>
            <LogoCineGo />
          </Link>
          <nav className="site-nav site-nav--desktop" aria-label="Navegación principal">
            <NavLink to="/" end>
              Películas
            </NavLink>
            <NavLink to="/candy">Candy</NavLink>
            <NavLink to="/reservas">Reservas</NavLink>
            {isAuthenticated && <NavLink to="/mis-reservas">Mis reservas</NavLink>}
          </nav>
        </div>

        <div className="site-header__actions">{renderAuthActions()}</div>

        <button
          className={`site-menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls={drawerId}
          onClick={toggleMenu}
        >
          <span className="site-menu-toggle__bar" />
          <span className="site-menu-toggle__bar" />
          <span className="site-menu-toggle__bar" />
        </button>
      </div>

      <div
        className={`site-drawer-backdrop${menuOpen ? " is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <HamburgerMenu
        drawerId={drawerId}
        menuOpen={menuOpen}
        closeMenu={closeMenu}
        renderAuthActions={renderAuthActions}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
}

export default Header;
