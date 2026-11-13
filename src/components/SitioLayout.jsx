import { Outlet } from "react-router-dom";
import Header from "./header/Header";
import Footer from "./footer/Footer";

// Lo que ve el cliente: navbar del sitio arriba, la página y el footer abajo.
// El panel de admin tiene su propio header, por eso no usa este layout.
function SitioLayout() {
  return (
    <div className="sitio-layout">
      <Header />
      <main className="App-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default SitioLayout;
