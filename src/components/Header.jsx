import { useEffect, useId, useState } from "react";
import "./Header.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LogoCineGo from "./LogoCineGo";

function UserIcon() {
  return (
    <svg
      className="site-login__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c1.4-3.1 3.6-4.5 6.5-4.5s5.1 1.4 6.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Header() {
  const { usuario, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerId = useId();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = (event) => {
      if (event.matches) closeMenu();
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
          </nav>
        </div>

        <div className="site-header__actions">{renderAuthActions()}</div>

        <button
          className={`site-menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls={drawerId}
          onClick={() => setMenuOpen((open) => !open)}
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

      <aside
        id={drawerId}
        className={`site-drawer${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Menú de navegación"
      >
        <div className="site-drawer__header">
          <span className="site-drawer__title">Menú</span>
          <button
            className="site-drawer__close"
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMenu}
          >
            ×
          </button>
        </div>
        <nav className="site-nav site-nav--drawer" aria-label="Navegación móvil">
          <NavLink to="/" end onClick={closeMenu}>
            Películas
          </NavLink>
          <NavLink to="/candy" onClick={closeMenu}>
            Candy
          </NavLink>
          <NavLink to="/reservas" onClick={closeMenu}>
            Reservas
          </NavLink>
        </nav>
        <div className="site-drawer__actions">{renderAuthActions()}</div>
      </aside>
    </header>
  );
}

export default Header;
