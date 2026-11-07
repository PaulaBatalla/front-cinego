import { Buffer } from "node:buffer";
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tokenVigente, leerToken } from '../src/utils/sesion.js';
import { configurarSesionVencida } from '../src/services/sesionService.js';

const token = (datos) => `header.${Buffer.from(JSON.stringify(datos)).toString('base64url')}.firma`;
const vigente = () => token({ sub: 'usuario@cinego.test', exp: Math.floor(Date.now() / 1000) + 60 });

let codigo = await readFile(new URL('../src/services/api.js', import.meta.url), 'utf8');
codigo = codigo.replace('"../utils/sesion"', JSON.stringify(new URL('../src/utils/sesion.js', import.meta.url).href))
  .replace('"./sesionService"', JSON.stringify(new URL('../src/services/sesionService.js', import.meta.url).href))
  .replace('import.meta.env.VITE_API_URL', 'undefined');
const { solicitar } = await import(`data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`);

async function conCliente(valor, respuesta, comprobar) {
  const anteriorFetch = globalThis.fetch;
  const anteriorStorage = globalThis.localStorage;
  const avisos = [];
  let llamadas = 0;
  globalThis.localStorage = { getItem: () => valor };
  globalThis.fetch = async () => { llamadas++; return new Response('', { status: respuesta }); };
  configurarSesionVencida((rechazado) => avisos.push(rechazado));
  try { await comprobar(avisos, () => llamadas); }
  finally {
    globalThis.fetch = anteriorFetch;
    globalThis.localStorage = anteriorStorage;
    configurarSesionVencida(() => {});
  }
}

test('el instante exacto de expiracion ya no es valido', () => {
  const jwt = token({ sub: 'usuario', exp: 100 });
  assert.equal(tokenVigente(jwt, 99999), true);
  assert.equal(tokenVigente(jwt, 100000), false);
});

test('rechaza tokens malformados o sin vencimiento', () => {
  for (const jwt of ['roto', token({ sub: 'usuario' }), token({ sub: 'usuario', exp: '100' })]) {
    assert.equal(tokenVigente(jwt), false);
  }
});

test('decodifica nombres Unicode', () => {
  assert.equal(leerToken(token({ sub: 'jos\u00e9@cinego.test', exp: 100 })).sub, 'jos\u00e9@cinego.test');
});

test('un 401 avisa al control central con el token de la solicitud', async () => {
  const jwt = vigente();
  await conCliente(jwt, 401, async (avisos) => {
    await assert.rejects(solicitar('/reservas'), { status: 401 });
    assert.deepEqual(avisos, [jwt]);
  });
});

test('un 403 con token vigente no cierra sesion', async () => {
  await conCliente(vigente(), 403, async (avisos) => {
    await assert.rejects(solicitar('/reservas'), (error) => error.status === 403 && error.message.includes('permisos'));
    assert.deepEqual(avisos, []);
  });
});

test('un token vencido se rechaza antes de enviar la solicitud', async () => {
  const jwt = token({ sub: 'usuario', exp: 1 });
  await conCliente(jwt, 200, async (avisos, llamadas) => {
    await assert.rejects(solicitar('/reservas'), { status: 401 });
    assert.deepEqual(avisos, [jwt]);
    assert.equal(llamadas(), 0);
  });
});

test('un 401 anonimo no genera un cierre de sesion', async () => {
  await conCliente(null, 401, async (avisos) => {
    await assert.rejects(solicitar('/reservas'), { status: 401 });
    assert.deepEqual(avisos, []);
  });
});
