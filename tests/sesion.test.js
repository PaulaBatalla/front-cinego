import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { store } = await vite.ssrLoadModule('/src/store/store.js');
const { loginUser, verificarSesion, logout } = await vite.ssrLoadModule('/src/store/slices/authSlice.js');
const { solicitar } = await vite.ssrLoadModule('/src/services/api.js');
const originalFetch = globalThis.fetch;
const usuario = { email: 'cliente@cinego.test', nombre: 'Cliente', rol: 'CLIENTE' };

afterEach(() => { globalThis.fetch = originalFetch; store.dispatch(logout()); });
after(async () => { await vite.close(); });

test('al cargar recupera el usuario desde la cookie', async () => {
  globalThis.fetch = async (url, opciones) => {
    assert.equal(url, '/api/usuarios/me');
    assert.equal(opciones.credentials, 'include');
    return Response.json(usuario);
  };
  await store.dispatch(verificarSesion());
  assert.deepEqual(store.getState().auth.usuario, usuario);
  assert.equal(store.getState().auth.isAuthenticated, true);
});

test('sin cookie la respuesta 403 deja al usuario desconectado', async () => {
  globalThis.fetch = async () => new Response(null, { status: 403 });
  await store.dispatch(verificarSesion());
  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.errorVerificacion, null);
});

test('un error de conexión al iniciar permite reintentar', async () => {
  globalThis.fetch = async () => { throw new Error('sin conexión'); };
  await store.dispatch(verificarSesion());
  assert.ok(store.getState().auth.errorVerificacion);
  globalThis.fetch = async () => Response.json(usuario);
  await store.dispatch(verificarSesion());
  assert.equal(store.getState().auth.isAuthenticated, true);
});

test('login usa la cookie y consulta los datos del usuario', async () => {
  const llamadas = [];
  globalThis.fetch = async (url, opciones) => {
    llamadas.push({ url, credentials: opciones.credentials });
    return url.endsWith('/login') ? new Response('token no utilizado') : Response.json(usuario);
  };
  await store.dispatch(loginUser({ email: usuario.email, password: '123' }));
  assert.deepEqual(llamadas, [
    { url: '/api/usuarios/login', credentials: 'include' },
    { url: '/api/usuarios/me', credentials: 'include' },
  ]);
  assert.equal(store.getState().auth.usuario.email, usuario.email);
  assert.equal('token' in store.getState().auth, false);
});

test('los pedidos incluyen cookies y no agregan Authorization', async () => {
  globalThis.fetch = async (_url, opciones) => {
    assert.equal(opciones.credentials, 'include');
    assert.equal(opciones.headers.Authorization, undefined);
    return Response.json([]);
  };
  await solicitar('/peliculas');
});

test('un 403 no cierra la sesión si /me confirma que sigue vigente', async () => {
  globalThis.fetch = async (url) => url.endsWith('/me') ? Response.json(usuario) : new Response(null, { status: 403 });
  await store.dispatch(verificarSesion());
  await assert.rejects(solicitar('/protegido'), { status: 403 });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(store.getState().auth.isAuthenticated, true);
});

test('si /me rechaza la cookie luego de un 403 se cierra la sesión', async () => {
  globalThis.fetch = async () => Response.json(usuario);
  await store.dispatch(verificarSesion());
  globalThis.fetch = async () => new Response(null, { status: 403 });
  await assert.rejects(solicitar('/reservas'), { status: 403 });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(store.getState().auth.isAuthenticated, false);
  assert.equal(store.getState().auth.sesionVencida, true);
});

test('una respuesta vieja no cierra una sesión iniciada después', async () => {
  globalThis.fetch = async () => Response.json(usuario);
  await store.dispatch(verificarSesion());
  let responder;
  globalThis.fetch = () => new Promise((resolve) => { responder = resolve; });
  const pedidoAnterior = solicitar('/reservas');
  globalThis.fetch = async (url) => url.endsWith('/login') ? new Response('') : Response.json(usuario);
  await store.dispatch(loginUser({ email: usuario.email, password: '123' }));
  responder(new Response(null, { status: 403 }));
  await assert.rejects(pedidoAnterior, { status: 403 });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(store.getState().auth.isAuthenticated, true);
});
