export default function ProgresoReserva({ paso }) {
  return <ol className="reserva-progreso" aria-label="Progreso de la reserva">
    {['Función', 'Asientos', 'Candy', 'Listo'].map((nombre, i) => <li key={nombre} className={i < paso ? 'completo' : i === paso ? 'actual' : ''} aria-current={i === paso ? 'step' : undefined}><span aria-hidden="true">{i < paso ? '✓' : i + 1}</span><strong>{nombre}</strong></li>)}
  </ol>;
}
