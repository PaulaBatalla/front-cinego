import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { default: candyReducer, agregarCandyLocal, fetchCarrito } = await vite.ssrLoadModule('/src/store/slices/candySlice.js');
const fetchOriginal = globalThis.fetch;
after(async () => { globalThis.fetch = fetchOriginal; await vite.close(); });

// Back simulado: el POST suma la cantidad si el producto ya está, como CarritoService
function simularBack(carrito, { fallaCandyId } = {}) {
  const posts = [];
  globalThis.fetch = async (url, opciones = {}) => {
    if (opciones.method === 'POST') {
      const { candyId, cantidad } = JSON.parse(opciones.body);
      posts.push({ candyId, cantidad });
      if (candyId === fallaCandyId) return new Response('Error', { status: 500 });
      const existente = carrito.find((item) => item.candyId === candyId);
      if (existente) existente.cantidad += cantidad;
      else carrito.push({ id: 100 + candyId, candyId, cantidad });
      return new Response(JSON.stringify(carrito.find((item) => item.candyId === candyId)));
    }
    return new Response(JSON.stringify(carrito));
  };
  return posts;
}

function carritoDeInvitado() {
  const store = configureStore({ reducer: { candy: candyReducer } });
  store.dispatch(agregarCandyLocal({ id: 10, nombre: 'Combo Pareja', precio: 5000 }));
  store.dispatch(agregarCandyLocal({ id: 10, nombre: 'Combo Pareja', precio: 5000 }));
  store.dispatch(agregarCandyLocal({ id: 11, nombre: 'Combo Solo', precio: 3500 }));
  return store;
}

test('al loguearse, lo agregado sin sesión se suma al carrito guardado en el back', async () => {
  const posts = simularBack([{ id: 110, candyId: 10, cantidad: 1 }]);
  const store = carritoDeInvitado();

  // Header y la página de Candy piden el carrito a la vez: solo debe subirse una vez
  await Promise.all([store.dispatch(fetchCarrito()), store.dispatch(fetchCarrito())]);

  assert.deepEqual(posts, [{ candyId: 10, cantidad: 2 }, { candyId: 11, cantidad: 1 }]);
  assert.deepEqual(store.getState().candy.items, [
    { id: 110, candyId: 10, cantidad: 3 },
    { id: 111, candyId: 11, cantidad: 1 },
  ]);
});

test('si un producto no se puede subir, se conserva como local', async () => {
  simularBack([], { fallaCandyId: 11 });
  const store = carritoDeInvitado();

  await store.dispatch(fetchCarrito());

  const items = store.getState().candy.items;
  assert.deepEqual(items.map((item) => [item.candyId, item.cantidad, Boolean(item.local)]), [[10, 2, false], [11, 1, true]]);
});

test('sin productos locales solo trae el carrito del back', async () => {
  const posts = simularBack([{ id: 110, candyId: 10, cantidad: 1 }]);
  const store = configureStore({ reducer: { candy: candyReducer } });

  await store.dispatch(fetchCarrito());

  assert.equal(posts.length, 0);
  assert.deepEqual(store.getState().candy.items, [{ id: 110, candyId: 10, cantidad: 1 }]);
});
