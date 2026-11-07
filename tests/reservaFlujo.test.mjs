import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'HTMLElement', 'Node', 'localStorage']) globalThis[key] = dom.window[key];
const { render, screen, fireEvent, cleanup, waitFor } = await import('@testing-library/react');
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { default: ReservaFuncion } = await vite.ssrLoadModule('/src/components/ReservaFuncion.jsx');
const { default: NotificacionesProvider } = await vite.ssrLoadModule('/src/context/NotificacionesProvider.jsx');
const { reservasApi } = await vite.ssrLoadModule('/src/services/reservasApi.js');
const { default: candyReducer } = await vite.ssrLoadModule('/src/store/slices/candySlice.js');
const fetchOriginal = globalThis.fetch;
let store;
let peticiones;
let conflicto;
function ReservaConRuta(props) {
  const ruta = useLocation();
  return React.createElement(React.Fragment, null,
    React.createElement('output', { 'data-testid': 'ruta' }, ruta.pathname),
    React.createElement(ReservaFuncion, props));
}
async function preparar() {
  peticiones = []; conflicto = false;
  globalThis.fetch = async (url, opciones = {}) => {
    if (opciones.method === 'POST') {
      peticiones.push(JSON.parse(opciones.body));
      return conflicto ? new Response('Butaca ocupada', { status: 409 }) : new Response(JSON.stringify({ idReserva: 50, estado: 'PENDIENTE', total: 16400 }));
    }
    return new Response(JSON.stringify([{ id: 1, fila: 'A', numero: 1, ocupado: false }, { id: 2, fila: 'A', numero: 2, ocupado: false }, { id: 3, fila: 'A', numero: 3, ocupado: true }]));
  };
  store = configureStore({ reducer: { auth: () => ({ token: null, usuario: { email: 'prueba@cinego.test' }, isAuthenticated: true }), candy: candyReducer, [reservasApi.reducerPath]: reservasApi.reducer }, middleware: (defecto) => defecto().concat(reservasApi.middleware) });
  render(React.createElement(Provider, { store }, React.createElement(MemoryRouter, null, React.createElement(NotificacionesProvider, null, React.createElement(ReservaConRuta, { funcion: { id: 1, peliculaId: 1, precio: 8200, horarioInicio: '2099-12-15T19:30:00', fecha: '2099-12-15', hora: '19:30', sala: 'Sala 3' }, pelicula: { titulo: 'Prueba' } }, React.createElement('p', null, 'Selector de funcion'))))));
  await screen.findByRole('button', { name: 'Butaca A1' });
}
function avanzar() {
  fireEvent.click(screen.getByRole('button', { name: 'Butaca A1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Butaca A2' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Continuar' })[0]);
}
afterEach(() => { cleanup(); if (store) store.dispatch(reservasApi.util.resetApiState()); });
after(async () => { globalThis.fetch = fetchOriginal; await vite.close(); dom.window.close(); });

test('continuar abre Candy sin crear la reserva y volver conserva las butacas', async () => {
  await preparar();
  assert.equal(screen.getByRole('button', { name: 'Butaca A3, ocupada' }).disabled, true);
  avanzar();
  assert.ok(screen.getByRole('heading', { name: '¿Y el pochoclo?' }));
  assert.equal(peticiones.length, 0);
  fireEvent.click(screen.getByRole('button', { name: /Cambiar asientos/ }));
  assert.equal(screen.getByRole('button', { name: 'Butaca A1' }).getAttribute('aria-pressed'), 'true');
});
test('confirmar despues de seleccionar Candy solo envia funcion y asientos', async () => {
  await preparar(); avanzar();
  fireEvent.click(screen.getByRole('button', { name: 'Agregar Combo Pareja al pedido' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Crear reserva' })[0]);
  await screen.findByRole('heading', { name: '¡Listo! Tu reserva fue creada.' });
  await waitFor(() => assert.equal(screen.getByTestId('ruta').textContent, '/checkout/50'));
  assert.deepEqual(peticiones, [{ funcionId: 1, asientoIds: [1, 2] }]);
  assert.ok(screen.getByText('Tenés 10 minutos para confirmar en Mis reservas. Si cerrás sesión, se cancela.'));
});
test('seguir sin Candy confirma y vacia la seleccion de productos', async () => {
  await preparar(); avanzar();
  fireEvent.click(screen.getByRole('button', { name: 'Agregar Combo Pareja al pedido' }));
  fireEvent.click(screen.getByRole('button', { name: 'Seguir sin candy' }));
  await screen.findByRole('heading', { name: '¡Listo! Tu reserva fue creada.' });
  assert.equal(store.getState().candy.items.length, 0);
});
test('un conflicto devuelve a asientos y elimina la seleccion anterior', async () => {
  await preparar(); avanzar(); conflicto = true;
  fireEvent.click(screen.getAllByRole('button', { name: 'Crear reserva' })[0]);
  await waitFor(() => assert.equal(screen.getByRole('button', { name: 'Butaca A1' }).getAttribute('aria-pressed'), 'false'));
  assert.equal(screen.queryByRole('heading', { name: '¿Y el pochoclo?' }), null);
});
