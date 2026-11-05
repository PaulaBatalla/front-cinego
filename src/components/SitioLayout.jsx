import { Outlet } from "react-router-dom";
import Header from "./header/Header";

// Lo que ve el cliente: navbar del sitio arriba y la página abajo.
// El panel de admin tiene su propio header, por eso no usa este layout.
function SitioLayout() {
  return (
    <>
      <Header />
      <main className="App-main">
        <Outlet />
      </main>
    </>
  );
}

export default SitioLayout;
