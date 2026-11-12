import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'HTMLElement', 'Node', 'localStorage']) globalThis[key] = dom.window[key];
const { renderHook, act, cleanup } = await import('@testing-library/react');
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { useAuth } = await vite.ssrLoadModule('/src/hooks/useAuth.js');
const { default: authReducer } = await vite.ssrLoadModule('/src/store/slices/authSlice.js');
const originalFetch = globalThis.fetch;

afterEach(() => { cleanup(); localStorage.clear(); globalThis.fetch = originalFetch; });
after(async () => { await vite.close(); dom.window.close(); });

for (const status of [204, 500]) {
  test(`cerrar sesión limpia el token si cancelar responde ${status}`, async () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'prueba@cinego.test', exp: Math.floor(Date.now() / 1000) + 60 })).toString('base64url');
    const token = `cabecera.${payload}.firma`;
    localStorage.setItem('token', token);
    let llamada;
    globalThis.fetch = async (url, opciones) => {
      llamada = { url, method: opciones.method };
      return new Response(status === 204 ? null : 'Error', { status });
    };
    const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { token, usuario: { email: 'prueba@cinego.test' }, isAuthenticated: true } } });
    const wrapper = ({ children }) => React.createElement(Provider, { store }, children);
    const { result } = renderHook(() => useAuth(), { wrapper });
    let canceladas;
    await act(async () => { canceladas = await result.current.logout(); });
    assert.equal(canceladas, status === 204);
    assert.equal(localStorage.getItem('token'), null);
    assert.equal(store.getState().auth.isAuthenticated, false);
    assert.deepEqual(llamada, { url: '/api/reservas/pendientes/cancelar', method: 'PATCH' });
  });
}
