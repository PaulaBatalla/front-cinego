import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="site-header" id="inicio">
      <Link className="site-brand" to="/">CineGo</Link>
      <nav className="site-nav" aria-label="Navegación principal">
        <Link to="/">Peliculas</Link>
        <Link to="/candy">Candy</Link>
      </nav>
    </header>
  );
}
export default Header;