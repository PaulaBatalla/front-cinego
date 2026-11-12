import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function crearEntradasPdf({ reserva, funcion, pelicula }) {
  if (!['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)) throw new Error('Esta reserva no permite descargar entradas.');
  const asientos = reserva.asientos;
  if (!Array.isArray(asientos) || !asientos.length || (Array.isArray(reserva.idsEntradas) && reserva.idsEntradas.length !== asientos.length) || asientos.some((a) => !a.fila || !Number.isInteger(a.numero)) || new Set(asientos.map((a) => `${a.fila}-${a.numero}`)).size !== asientos.length) {
    throw new Error('No podemos identificar todas las butacas de esta reserva.');
  }
  if (!funcion?.salaNombre || !Number.isFinite(Date.parse(funcion.horarioInicio)) || !pelicula?.titulo) throw new Error('Faltan datos de la pelicula o funcion para descargar las entradas.');
  const pdf = await PDFDocument.create();
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
  const caracteres = new Set(normal.getCharacterSet());
  const textoSeguro = (valor) => [...String(valor).normalize('NFC').replace(/\s+/g, ' ')].map((c) => caracteres.has(c.codePointAt(0)) ? c : '?').join('');
  const tinta = rgb(.08, .08, .1), gris = rgb(.38, .37, .41), naranja = rgb(1, .42, .29);
  pdf.setTitle(`CineGo - Reserva ${reserva.idReserva}`);
  pdf.setAuthor('CineGo');
  const horario = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(funcion.horarioInicio));
  const ordenados = [...asientos].sort((a, b) => String(a.fila).localeCompare(String(b.fila)) || a.numero - b.numero);
  for (const [indice, asiento] of ordenados.entries()) {
    const pagina = pdf.addPage([420, 595]);
    const escribir = (valor, x, y, size = 12, font = normal, color = tinta, ancho = 348) => {
      let texto = textoSeguro(valor);
      while (font.widthOfTextAtSize(texto, size) > ancho && size > 8) size--;
      if (font.widthOfTextAtSize(texto, size) > ancho) {
        while (texto && font.widthOfTextAtSize(texto + '...', size) > ancho) texto = texto.slice(0, -1);
        texto += '...';
      }
      pagina.drawText(texto, { x, y, size, font, color });
    };
    pagina.drawRectangle({ x: 0, y: 515, width: 420, height: 80, color: tinta });
    escribir('CINEGO', 36, 548, 26, negrita, rgb(1, 1, 1));
    escribir(`ENTRADA ${indice + 1} DE ${asientos.length}`, 36, 527, 10, normal, rgb(.85, .84, .83));
    escribir(pelicula.titulo, 36, 475, 24, negrita);
    escribir(`Reserva #${reserva.idReserva}`, 36, 448, 12, normal, gris);
    escribir(reserva.estado === 'CONFIRMADA' ? 'RESERVA CONFIRMADA' : 'RESERVA PENDIENTE - NO CONFIRMADA', 36, 412, 12, negrita, reserva.estado === 'CONFIRMADA' ? rgb(.12, .38, .25) : rgb(.55, .3, .05));
    escribir('FUNCION', 36, 373, 9, negrita, gris);
    escribir(horario, 36, 351, 13);
    escribir('SALA', 36, 316, 9, negrita, gris);
    escribir(funcion.salaNombre, 36, 296, 15, negrita);
    pagina.drawRectangle({ x: 36, y: 170, width: 348, height: 100, color: rgb(1, .96, .94), borderColor: naranja, borderWidth: 1 });
    escribir('BUTACA', 54, 245, 10, negrita, gris, 312);
    escribir(`${asiento.fila}${asiento.numero}`, 54, 190, 44, negrita, tinta, 312);
    escribir('Una entrada corresponde a una sola butaca.', 36, 140, 11, normal, gris);
    escribir('La vigencia depende del estado actual de la reserva.', 36, 120, 10, normal, gris);
    pagina.drawLine({ start: { x: 36, y: 90 }, end: { x: 384, y: 90 }, color: rgb(.83, .82, .81), thickness: 1 });
    escribir('Conserva esta entrada para consultar tu ubicacion.', 36, 68, 10, normal, gris);
    escribir(`CineGo / Reserva ${reserva.idReserva} / Butaca ${asiento.fila}${asiento.numero}`, 36, 48, 9, normal, gris);
  }
  return pdf.save();
}

export async function descargarEntradasPdf(datos) {
  const bytes = await crearEntradasPdf(datos);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `cinego-reserva-${String(datos.reserva.idReserva).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
