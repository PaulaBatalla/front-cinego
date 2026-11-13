import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createServer } from 'vite';
import { formatearPorcentaje } from '../src/utils/promos.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'HTMLElement', 'Node']) globalThis[key] = dom.window[key];
const { render, screen, fireEvent, cleanup } = await import('@testing-library/react');
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { default: PromoFormModal } = await vite.ssrLoadModule('/src/components/admin/promos/PromosFormModal.jsx');

afterEach(cleanup);
after(async () => { await vite.close(); dom.window.close(); });

test('guardar una promo conserva el porcentaje decimal ingresado', () => {
  let datosGuardados;
  render(React.createElement(PromoFormModal, {
    promo: null, peliculas: [], onCerrar: () => {},
    onGuardar: async (datos) => { datosGuardados = datos; },
  }));
  fireEvent.change(screen.getByLabelText('Nombre de la promo'), { target: { value: 'Promo de prueba' } });
  fireEvent.change(screen.getByLabelText(/Descuento/), { target: { value: '12.5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar promo' }));
  assert.equal(datosGuardados.porcentaje, 12.5);
  assert.equal(formatearPorcentaje(datosGuardados.porcentaje), '−12,5%');
});
