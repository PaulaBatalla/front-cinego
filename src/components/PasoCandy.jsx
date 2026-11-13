import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CandyCard from "./CandyCard";
import { candyService } from "../services/candyService";
import { useAuth } from "../hooks/useAuth";
import { fetchCarrito } from "../store/slices/candySlice";
import "./Candy.css";

export default function PasoCandy({ cantidad, onVolver, onOmitir, disabled }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [candy, setCandy] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCarrito());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const controlador = new AbortController();
    candyService
      .listar(controlador.signal)
      .then((datos) => setCandy(datos ?? []))
      .catch((err) => {
        if (!controlador.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });
    return () => controlador.abort();
  }, []);

  const recomendado =
    candy.find(
      (p) =>
        p.nombre ===
        (cantidad >= 3 ? "Combo Familiar" : cantidad === 2 ? "Combo Pareja" : "Combo Solo"),
    ) || candy.find((p) => p.nombre?.toLowerCase().includes("combo"));

  const estado =
    cargando
      ? "Cargando candy..."
      : error
        ? `No se pudo cargar Candy: ${error}`
        : candy.length === 0
          ? "No hay productos de candy cargados."
          : null;

  return (
    <section className="reserva-candy" aria-labelledby="reserva-candy-titulo">
      <button type="button" className="reserva-enlace" onClick={onVolver} disabled={disabled}>
        ← Cambiar asientos
      </button>
      <h2 id="reserva-candy-titulo">¿Y el pochoclo?</h2>
      <p className="reserva-nota">
        Sumá tus combos favoritos a tu carrito. Se guardarán en tu cuenta y podrás abonarlos junto con tus entradas en el pago final.
      </p>
      {estado && <p className="reserva-nota">{estado}</p>}
      {!estado && (
        <fieldset disabled={disabled}>
          {recomendado && (
            <div className="reserva-candy-recomendado">
              <p className="selector-titulo">
                Recomendado para tus {cantidad} {cantidad === 1 ? "entrada" : "entradas"}
              </p>
              <CandyCard item={recomendado} />
            </div>
          )}
          <h3 className="selector-titulo">Sumá algo más</h3>
          <div className="reserva-candy-grilla">
            {candy
              .filter((p) => p.id !== recomendado?.id)
              .map((p) => (
                <CandyCard key={p.id} item={p} />
              ))}
          </div>
        </fieldset>
      )}
      <button
        type="button"
        className="reserva-enlace reserva-omitir"
        onClick={onOmitir}
        disabled={disabled}
      >
        Seguir sin candy
      </button>
    </section>
  );
}
