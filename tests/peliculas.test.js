import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { configureStore } from '@reduxjs/toolkit';

async function preparar() {
  const pendientes = new Map();
  // Conserva la implementacion real de endpoints y cache; solo simula la red.
  const servicio = `export const solicitar = (ruta, opciones) => globalThis.__redPeliculas(ruta, opciones);`;
  let codigo = await readFile(new URL('../src/services/reservasApi.js', import.meta.url), 'utf8');
  codigo = codigo.replace('"@reduxjs/toolkit/query/react"', JSON.stringify(import.meta.resolve('@reduxjs/toolkit/query/react')))
    .replace('"./api"', JSON.stringify(`data:text/javascript;base64,${Buffer.from(servicio).toString('base64')}`));
  const { reservasApi } = await import(`data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`);
  globalThis.__redPeliculas = (ruta, opciones) => new Promise((resolve, reject) => pendientes.set(ruta, { resolve, reject, opciones }));
  const store = configureStore({ reducer: { [reservasApi.reducerPath]: reservasApi.reducer }, middleware: (getDefault) => getDefault().concat(reservasApi.middleware) });
  return { pendientes, api: reservasApi, store };
}

test('una respuesta tardia de A no reemplaza los datos de B', async () => {
  const { pendientes, api, store } = await preparar();
  try {
    const a = store.dispatch(api.endpoints.pelicula.initiate('1'));
    const b = store.dispatch(api.endpoints.pelicula.initiate('2'));
    pendientes.get('/peliculas/2').resolve({ id: 2, titulo: 'B' });
    await b;
    pendientes.get('/peliculas/1').resolve({ id: 1, titulo: 'A' });
    await a;
    assert.equal(api.endpoints.pelicula.select('2')(store.getState()).data.titulo, 'B');
    assert.equal(api.endpoints.pelicula.select('1')(store.getState()).data.titulo, 'A');
  } finally { store.dispatch(api.util.resetApiState()); delete globalThis.__redPeliculas; }
});

test('el error de una pelicula no se arrastra a la siguiente', async () => {
  const { pendientes, api, store } = await preparar();
  try {
    const a = store.dispatch(api.endpoints.pelicula.initiate('1'));
    pendientes.get('/peliculas/1').reject(Object.assign(new Error('No existe'), { status: 404 }));
    await a;
    const b = store.dispatch(api.endpoints.pelicula.initiate('2'));
    pendientes.get('/peliculas/2').resolve({ id: 2, titulo: 'B' });
    await b;
    const resultado = api.endpoints.pelicula.select('2')(store.getState());
    assert.equal(resultado.error, undefined);
    assert.equal(resultado.data.id, 2);
  } finally { store.dispatch(api.util.resetApiState()); delete globalThis.__redPeliculas; }
});

test('cancelar usa PATCH y actualiza el historial y las butacas activas', async () => {
  const { pendientes, api, store } = await preparar();
  try {
    const historial = store.dispatch(api.endpoints.misReservas.initiate());
    const butacas = store.dispatch(api.endpoints.asientos.initiate(7));
    pendientes.get('/reservas/mis-reservas').resolve([{ idReserva: 50, estado: 'PENDIENTE' }]);
    pendientes.get('/funciones/7/asientos').resolve([{ id: 1, ocupado: true }]);
    await Promise.all([historial, butacas]);
    const cancelar = store.dispatch(api.endpoints.cancelarReserva.initiate({ idReserva: 50, funcionId: 7 }));
    assert.equal(pendientes.get('/reservas/50/cancelar').opciones.method, 'PATCH');
    pendientes.get('/reservas/50/cancelar').resolve({ idReserva: 50, estado: 'CANCELADA' });
    await cancelar;
    pendientes.get('/reservas/mis-reservas').resolve([{ idReserva: 50, estado: 'CANCELADA' }]);
    pendientes.get('/funciones/7/asientos').resolve([{ id: 1, ocupado: false }]);
    await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
    assert.equal(api.endpoints.misReservas.select()(store.getState()).data[0].estado, 'CANCELADA');
    assert.equal(api.endpoints.asientos.select(7)(store.getState()).data[0].ocupado, false);
  } finally { store.dispatch(api.util.resetApiState()); delete globalThis.__redPeliculas; }
});
