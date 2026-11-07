import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'HTMLElement', 'Node', 'localStorage']) globalThis[key] = dom.window[key];
const { render, screen, fireEvent, cleanup } = await import('@testing-library/react');
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { default: Checkout } = await vite.ssrLoadModule('/src/pages/Checkout.jsx');
const { reservasApi } = await vite.ssrLoadModule('/src/services/reservasApi.js');
const originalFetch = globalThis.fetch;
let store;
let pagos;

function preparar({ estado = 'PENDIENTE', minutos = 1 } = {}) {
  pagos = [];
  const reserva = { idReserva: 50, idFuncion: 7, estado, fechaReserva: new Date(Date.now() - minutos * 60000).toISOString(), total: 8000, asientos: [{ fila: 'A', numero: 1 }] };
  globalThis.fetch = async (url, opciones = {}) => {
    let datos;
    if (opciones.method === 'PATCH') {
      pagos.push({ url, method: opciones.method });
      datos = { ...reserva, estado: 'CONFIRMADA' };
    } else if (url.endsWith('/funciones')) {
      datos = [{ id: 7, peliculaId: 2, horarioInicio: '2099-12-15T19:30:00', salaNombre: 'Sala 1' }];
    } else if (url.endsWith('/peliculas')) {
      datos = [{ id: 2, titulo: 'Prueba' }];
    } else datos = reserva;
    return new Response(JSON.stringify(datos));
  };
  store = configureStore({ reducer: { auth: () => ({ isAuthenticated: true }), [reservasApi.reducerPath]: reservasApi.reducer }, middleware: (defecto) => defecto().concat(reservasApi.middleware) });
  render(React.createElement(Provider, { store }, React.createElement(MemoryRouter, { initialEntries: ['/checkout/50'] }, React.createElement(Routes, null, React.createElement(Route, { path: '/checkout/:id', element: React.createElement(Checkout) })))));
}

afterEach(() => { cleanup(); store?.dispatch(reservasApi.util.resetApiState()); });
after(async () => { globalThis.fetch = originalFetch; await vite.close(); dom.window.close(); });

test('checkout consulta una reserva individual y confirma usando su ID', async () => {
  preparar();
  const boton = await screen.findByRole('button', { name: 'Confirmar pago' });
  assert.equal(boton.disabled, true);
  fireEvent.click(screen.getByRole('radio', { name: 'Tarjeta' }));
  fireEvent.click(boton);
  await screen.findByRole('heading', { name: 'Reserva confirmada' });
  assert.deepEqual(pagos, [{ url: '/api/reservas/50/confirmar', method: 'PATCH' }]);
});

test('checkout impide confirmar una pendiente vencida', async () => {
  preparar({ minutos: 11 });
  await screen.findByText('La reserva venció. Las butacas quedaron disponibles.');
  assert.equal(screen.queryByRole('button', { name: 'Confirmar pago' }), null);
  assert.equal(pagos.length, 0);
});

test('checkout no ofrece pago para una reserva cancelada', async () => {
  preparar({ estado: 'CANCELADA' });
  await screen.findByText('Esta reserva está cancelada.');
  assert.equal(screen.queryByRole('button', { name: 'Confirmar pago' }), null);
});
