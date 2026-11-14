import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';

// localStorage falso: los tests corren en Node, sin navegador
const guardado = new Map();
globalThis.localStorage = {
  getItem: (clave) => (guardado.has(clave) ? guardado.get(clave) : null),
  setItem: (clave, valor) => guardado.set(clave, String(valor)),
  removeItem: (clave) => guardado.delete(clave),
};

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { leerCarritoInvitado, guardarCarritoInvitado } = await vite.ssrLoadModule('/src/utils/carritoInvitado.js');
const { default: candyReducer, agregarCandyLocal } = await vite.ssrLoadModule('/src/store/slices/candySlice.js');
beforeEach(() => guardado.clear());
after(async () => { delete globalThis.localStorage; await vite.close(); });

const crearStore = () => configureStore({ reducer: { candy: candyReducer } });

test('el carrito de invitado sobrevive a una recarga', () => {
  const antes = crearStore();
  antes.dispatch(agregarCandyLocal({ id: 10, nombre: 'Combo Pareja', precio: 5000 }));
  antes.dispatch(agregarCandyLocal({ id: 10, nombre: 'Combo Pareja', precio: 5000 }));
  guardarCarritoInvitado(antes.getState().candy.items);

  // Recargar la página = crear el store de nuevo
  const despues = crearStore();
  const [item] = despues.getState().candy.items;
  assert.equal(despues.getState().candy.items.length, 1);
  assert.deepEqual([item.candyId, item.cantidad, item.local], [10, 2, true]);
});

test('solo se guardan los productos agregados sin sesión', () => {
  guardarCarritoInvitado([
    { id: 110, candyId: 10, cantidad: 1 },
    { id: 11, candyId: 11, cantidad: 2, local: true },
  ]);
  assert.deepEqual(leerCarritoInvitado().map((item) => item.candyId), [11]);
});

test('cuando ya no quedan productos de invitado se borra la clave', () => {
  guardarCarritoInvitado([{ id: 11, candyId: 11, cantidad: 1, local: true }]);
  guardarCarritoInvitado([{ id: 111, candyId: 11, cantidad: 1 }]);
  assert.equal(localStorage.getItem('carritoInvitado'), null);
});

test('un dato corrupto en localStorage no rompe la app', () => {
  localStorage.setItem('carritoInvitado', '{esto no es json');
  assert.deepEqual(leerCarritoInvitado(), []);
  assert.deepEqual(crearStore().getState().candy.items, []);
});
