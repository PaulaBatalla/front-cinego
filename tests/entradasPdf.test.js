import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { PDFDocument, decodePDFRawStream } from 'pdf-lib';
import { crearEntradasPdf } from '../src/utils/entradasPdf.js';
const datos = () => ({ reserva: { idReserva: 50, estado: 'CONFIRMADA', idsEntradas: [10, 11, 12], asientos: [{ fila: 'A', numero: 3 }, { fila: 'A', numero: 4 }, { fila: 'B', numero: 12 }] }, funcion: { salaNombre: 'Sala 2', horarioInicio: '2026-11-10T20:30:00' }, pelicula: { titulo: 'La odisea' } });
function contenido(pdf, pagina) {
  const streams = pagina.node.Contents();
  return Array.from({ length: streams.size() }, (_, i) => Buffer.from(decodePDFRawStream(pdf.context.lookup(streams.get(i))).decode()).toString('latin1')).join('');
}
const hex = (texto) => Buffer.from(texto).toString('hex').toUpperCase();
test('tres asientos generan tres paginas, cada una con su propia butaca', async () => {
  const pdf = await PDFDocument.load(await crearEntradasPdf(datos()));
  assert.equal(pdf.getPageCount(), 3);
  const butacas = ['A3', 'A4', 'B12'];
  for (const [i, pagina] of pdf.getPages().entries()) {
    const texto = contenido(pdf, pagina);
    assert.ok(texto.includes(`<${hex(butacas[i])}>`));
    for (const otra of butacas.filter((_, j) => j !== i)) assert.equal(texto.includes(`<${hex(otra)}>`), false);
  }
});
test('una reserva pendiente no genera una entrada marcada como confirmada', async () => {
  const d = datos(); d.reserva.estado = 'PENDIENTE';
  const pdf = await PDFDocument.load(await crearEntradasPdf(d));
  assert.ok(contenido(pdf, pdf.getPage(0)).includes(hex('RESERVA PENDIENTE - NO CONFIRMADA')));
});
test('no emite entradas de reservas canceladas o con informacion incompleta', async () => {
  for (const cambiar of [d => d.reserva.estado = 'CANCELADA', d => d.reserva.asientos = [], d => d.reserva.asientos.push(d.reserva.asientos[0]), d => d.funcion = null, d => d.pelicula = null, d => d.reserva.idsEntradas.push(13)]) {
    const d = datos(); cambiar(d);
    await assert.rejects(crearEntradasPdf(d));
  }
});
test('admite titulos largos y caracteres que no soporta la fuente sin fallar', async () => {
  const d = datos(); d.pelicula.titulo = 'Una pel\u00edcula muy larga \ud83c\udfac '.repeat(20);
  const pdf = await PDFDocument.load(await crearEntradasPdf(d));
  assert.equal(pdf.getPageCount(), 3);
});
