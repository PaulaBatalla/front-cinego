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
afterEach(() => { cleanup(); globalThis.fetch = originalFetch; });
after(async () => { await vite.close(); dom.window.close(); });

for (const status of [204, 500]) {
  test(`logout cancela pendientes (${status}) y pide borrar la cookie`, async () => {
    const llamadas = [];
    globalThis.fetch = async (url, opciones) => {
      llamadas.push({ url, method: opciones.method, credentials: opciones.credentials });
      return new Response(null, { status: url.endsWith('/logout') ? 204 : status });
    };
    const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { usuario: { email: 'prueba@cinego.test' }, isAuthenticated: true, versionSesion: 0 } } });
    const wrapper = ({ children }) => React.createElement(Provider, { store }, children);
    const { result } = renderHook(() => useAuth(), { wrapper });
    let canceladas;
    await act(async () => { canceladas = await result.current.logout(); });
    assert.equal(canceladas, status === 204);
    assert.equal(store.getState().auth.isAuthenticated, false);
    assert.deepEqual(llamadas, [
      { url: '/api/reservas/pendientes/cancelar', method: 'PATCH', credentials: 'include' },
      { url: '/api/usuarios/logout', method: 'POST', credentials: 'include' },
    ]);
  });
}

test('si falla el logout no anuncia una sesión cerrada', async () => {
  globalThis.fetch = async (url) => new Response(null, { status: url.endsWith('/logout') ? 500 : 204 });
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { usuario: { email: 'prueba@cinego.test' }, isAuthenticated: true, versionSesion: 0 } } });
  const wrapper = ({ children }) => React.createElement(Provider, { store }, children);
  const { result } = renderHook(() => useAuth(), { wrapper });
  await act(async () => { await assert.rejects(result.current.logout()); });
  assert.equal(store.getState().auth.isAuthenticated, true);
});
