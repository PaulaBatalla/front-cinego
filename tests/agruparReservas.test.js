import test from 'node:test';
import assert from 'node:assert/strict';
import { agruparReservas } from '../src/utils/agruparReservas.js';
const ahora = Date.parse('2026-11-10T20:00:00');
const funciones = [{ id: 1, horarioInicio: '2026-11-10T21:00:00' }, { id: 2, horarioInicio: '2026-11-11T20:00:00' }, { id: 3, horarioInicio: '2026-11-10T19:00:00' }, { id: 4, horarioInicio: '2026-11-09T20:00:00' }];
const reserva = (idFuncion, estado = 'PENDIENTE') => ({ idFuncion, idReserva: Number(idFuncion), estado });

test('ordena proximas por inicio y pasadas de mas reciente a mas antigua', () => {
  const grupos = agruparReservas([reserva(2), reserva(4), reserva(1), reserva(3)], funciones, ahora);
  assert.deepEqual(grupos.proximas.map((i) => i.reserva.idFuncion), [1, 2]);
  assert.deepEqual(grupos.pasadas.map((i) => i.reserva.idFuncion), [3, 4]);
});
test('una cancelada no aparece tambien en proximas o pasadas', () => {
  const grupos = agruparReservas([reserva(1, 'CANCELADA'), reserva(3, 'CANCELADA')], funciones, ahora);
  assert.equal(grupos.canceladas.length, 2);
  assert.equal(grupos.proximas.length + grupos.pasadas.length, 0);
});
test('conserva reservas sin funcion o sin horario sin clasificarlas como pasadas', () => {
  const grupos = agruparReservas([reserva(5), reserva(6)], [{ id: 6, horarioInicio: 'invalido' }], ahora);
  assert.equal(grupos.sinHorario.length, 2);
  assert.equal(grupos.pasadas.length, 0);
});
test('al comenzar la funcion pasa de proximas a pasadas', () => {
  assert.equal(agruparReservas([reserva(1)], funciones, Date.parse(funciones[0].horarioInicio)).pasadas.length, 1);
});
test('acepta IDs como texto, no modifica la entrada y ordena canceladas por fecha de reserva', () => {
  const entrada = [{ ...reserva('1', 'CANCELADA'), fechaReserva: '2026-11-01T10:00:00' }, { ...reserva('2', 'CANCELADA'), fechaReserva: '2026-11-02T10:00:00' }];
  const copia = structuredClone(entrada);
  const grupos = agruparReservas(entrada, funciones, ahora);
  assert.equal(grupos.canceladas[0].reserva.idReserva, 2);
  assert.equal(grupos.canceladas[1].funcion.id, 1);
  assert.deepEqual(entrada, copia);
});
