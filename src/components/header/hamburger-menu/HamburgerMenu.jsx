import { NavLink } from "react-router-dom";
import { CloseIcon } from "../../icons";

function HamburgerMenu({ drawerId, menuOpen, closeMenu, renderAuthActions }) {
  return (
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
            <CloseIcon />
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
  );
}

export default HamburgerMenu;