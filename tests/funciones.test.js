import test from 'node:test';
import assert from 'node:assert/strict';
import { buscarSuperposiciones } from '../src/utils/funciones.js';

const existente = { id: 1, peliculaId: 7, salaId: 2, fecha: '2026-11-10', hora: '23:30' };
const buscar = (nueva, funciones = [existente], excluirId) => buscarSuperposiciones(
  { fecha: '2026-11-11', hora: '00:30', salaId: '2', duracion: 120, ...nueva }, funciones, () => 120, excluirId,
);

test('detecta una funcion del dia anterior que cruza medianoche', () => {
  assert.equal(buscar({}).length, 1);
});
test('detecta el conflicto tambien al agregar primero la funcion nocturna', () => {
  assert.equal(buscar({ fecha: '2026-11-10', hora: '23:30' }, [{ ...existente, fecha: '2026-11-11', hora: '00:30' }]).length, 1);
});
test('bloquea mientras no se cumplan los 15 minutos de limpieza', () => {
  assert.equal(buscar({ hora: '01:44' }).length, 1);
  assert.equal(buscar({ hora: '01:45' }).length, 0);
});
test('no bloquea otras salas, ni funciones de dias lejanos', () => {
  assert.equal(buscar({ salaId: 3 }).length, 0);
  assert.equal(buscar({ fecha: '2026-11-12' }).length, 0);
});
test('editar una funcion no genera conflicto consigo misma', () => {
  assert.equal(buscar({}, [existente], '1').length, 0);
});
test('mantiene la deteccion durante el mismo dia y al cambiar de anio', () => {
  assert.equal(buscar({ fecha: '2026-11-10', hora: '23:00' }).length, 1);
  assert.equal(buscar({ fecha: '2027-01-01' }, [{ ...existente, fecha: '2026-12-31' }]).length, 1);
});
test('no calcula conflictos con horarios o duraciones invalidos', () => {
  assert.equal(buscar({ hora: '' }).length, 0);
  assert.equal(buscar({ duracion: 0 }).length, 0);
});
