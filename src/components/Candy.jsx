import { useState } from "react";
import { Link } from "react-router-dom";
import CandyCard from "./CandyCard";
import ResumenCandy from "./ResumenCandy";
import { useCandy } from "../hooks/useCandy";
import "./Candy.css";

const CATEGORIAS = ["Todos", "Combos", "Pochoclos", "Bebidas", "Dulces"];

function Candy() {
  const { candy } = useCandy();
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const productosFiltrados =
    categoriaActiva === "Todos"
      ? candy
      : candy.filter((p) => p.categoria === categoriaActiva);

  return (
    <main className="candy-pagina">
      {/* Encabezado y filtros por categoría */}
      <header className="candy-header">
        <div className="candy-titulos">
          <h1>Candy</h1>
          <p>
            Combos y promos para disfrutar la función. Pedilo online y retiralo sin
            hacer fila.
          </p>
        </div>

        <nav className="candy-categorias" aria-label="Filtro de categorías de Candy">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`candy-categoria-btn ${
                categoriaActiva === cat ? "activa" : ""
              }`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      {/* Banner de descuento y pedido express */}
      <section className="candy-promo-banner" aria-label="Beneficio de compra online">
        <div className="candy-promo-info">
          <div className="candy-promo-icono" aria-hidden="true">
            ⚡
          </div>
          <div className="candy-promo-texto">
            <strong>Pedilo junto con tu entrada y no hagas fila</strong>
            <span>
              Precio online hasta 17% menor. Lo retirás en el Mostrador Express
              con tu QR.
            </span>
          </div>
        </div>

        <Link to="/" className="candy-promo-link">
          Elegir función →
        </Link>
      </section>

      {/* Grilla de productos de Candy */}
      <section className="candy-grilla" aria-label="Listado de combos y golosinas">
        {productosFiltrados.map((producto) => (
          <CandyCard key={producto.id} item={producto} />
        ))}
      </section>

      {/* Resumen del pedido (se activa cuando el usuario agrega items) */}
      <ResumenCandy />
    </main>
  );
}

export default Candy;