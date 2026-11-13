function MapaAsientos({ filas, asientosPorFila, tamano = 10, conEtiqueta = false }) {
  const anchoPuntos = Math.min(asientosPorFila * tamano, 260);
  const altoPuntos = Math.min(filas * tamano, 200);

  return (
    <div className="admin-mapa" aria-hidden="true">
      {conEtiqueta && <span className="admin-mapa__etiqueta">PANTALLA</span>}
      <div className="admin-mapa__pantalla" />
      <div
        className="admin-mapa__asientos"
        style={{
          width: anchoPuntos,
          height: altoPuntos,
          backgroundImage: `radial-gradient(circle, #4a4a52 ${tamano * 0.28}px, transparent ${
            tamano * 0.32
          }px)`,
          backgroundSize: `${tamano}px ${tamano}px`,
        }}
      />
    </div>
  );
}

export default MapaAsientos;
