import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoCancelacion } from '../src/utils/cancelacionReservas.js';
const inicio = Date.parse('2026-11-10T20:00:00-03:00');
const funcion = { horarioInicio: '2026-11-10T20:00:00-03:00' };
const reserva = { estado: 'PENDIENTE' };

test('permite cancelar con mas de 30 minutos y en el limite exacto', () => {
  for (const minutos of [60, 31, 30]) assert.equal(estadoCancelacion(reserva, funcion, inicio - minutos * 60000).permitido, true);
  assert.equal(estadoCancelacion({ estado: 'CONFIRMADA' }, funcion, inicio - 1800000).permitido, true);
});
test('bloquea un milisegundo despues del limite, durante y despues de la funcion', () => {
  for (const ahora of [inicio - 1800000 + 1, inicio - 60000, inicio, inicio + 60000]) assert.equal(estadoCancelacion(reserva, funcion, ahora).permitido, false);
});
test('no permite cancelar reservas canceladas o con estado desconocido', () => {
  for (const estado of ['CANCELADA', 'DESCONOCIDO', undefined]) assert.equal(estadoCancelacion({ estado }, funcion, inicio - 3600000).permitido, false);
});
test('sin funcion o sin horario valido no ofrece cancelar', () => {
  for (const f of [undefined, {}, { horarioInicio: 'invalido' }]) assert.equal(estadoCancelacion(reserva, f).permitido, false);
});
