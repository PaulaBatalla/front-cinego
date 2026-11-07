import CandyCard from './CandyCard';
import { useCandy } from '../hooks/useCandy';
import '../components/Candy.css';

export default function PasoCandy({ cantidad, onVolver, onOmitir, disabled }) {
  const { candy } = useCandy();
  const recomendado = candy.find((p) => p.nombre === (cantidad >= 3 ? 'Combo Familiar' : cantidad === 2 ? 'Combo Pareja' : 'Combo Solo'));
  return <section className="reserva-candy" aria-labelledby="reserva-candy-titulo">
    <button type="button" className="reserva-enlace" onClick={onVolver} disabled={disabled}>← Cambiar asientos</button>
    <h2 id="reserva-candy-titulo">¿Y el pochoclo?</h2>
    <p className="reserva-nota">Probá tu selección de Candy. Los productos no se incluyen en esta reserva; podés comprarlos en el cine.</p>
    <fieldset disabled={disabled}>
      {recomendado && <div className="reserva-candy-recomendado"><p className="selector-titulo">Recomendado para tus {cantidad} {cantidad === 1 ? 'entrada' : 'entradas'}</p><CandyCard item={recomendado} /></div>}
      <h3 className="selector-titulo">Sumá algo más</h3>
      <div className="reserva-candy-grilla">{candy.filter((p) => p.id !== recomendado?.id).map((p) => <CandyCard key={p.id} item={p} />)}</div>
    </fieldset>
    <button type="button" className="reserva-enlace reserva-omitir" onClick={onOmitir} disabled={disabled}>Seguir sin candy</button>
  </section>;
}
