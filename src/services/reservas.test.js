import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { crearReserva } from "./reservas.js";

const fetchOriginal = globalThis.fetch;
const storageOriginal = globalThis.localStorage;
afterEach(() => {
  globalThis.fetch = fetchOriginal;
  globalThis.localStorage = storageOriginal;
});

test("envía los IDs reales con JWT y devuelve la reserva creada", async () => {
  globalThis.localStorage = { getItem: () => "token-prueba" };
  globalThis.fetch = async (url, opciones) => {
    assert.equal(url, "http://localhost:8080/api/reservas");
    assert.equal(opciones.method, "POST");
    assert.equal(opciones.headers.Authorization, "Bearer token-prueba");
    assert.equal(opciones.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(opciones.body), { funcionId: 1, asientoIds: [3, 4] });
    return new Response(JSON.stringify({ idReserva: 10, total: 7000 }), { status: 201 });
  };
  assert.deepEqual(await crearReserva({ funcionId: 1, asientoIds: [3, 4] }), {
    idReserva: 10, total: 7000,
  });
});

test("sin token no envía una reserva", async () => {
  globalThis.localStorage = { getItem: () => null };
  globalThis.fetch = () => assert.fail("No debe llamar al backend");
  await assert.rejects(crearReserva({ funcionId: 1, asientoIds: [3] }), /iniciar sesión/);
});

test("rechaza etiquetas de ejemplo, IDs repetidos y selecciones vacías", async () => {
  globalThis.localStorage = { getItem: () => "token-prueba" };
  globalThis.fetch = () => assert.fail("No debe llamar al backend");
  for (const asientoIds of [["A1"], [3, 3], [], [0]]) {
    await assert.rejects(crearReserva({ funcionId: 1, asientoIds }), /IDs válidos/);
  }
  await assert.rejects(crearReserva({ funcionId: null, asientoIds: [3] }), /función/);
});

test("propaga el mensaje de asiento ocupado del backend", async () => {
  globalThis.localStorage = { getItem: () => "token-prueba" };
  globalThis.fetch = async () => new Response("Uno o más asientos ya están reservados", { status: 409 });
  await assert.rejects(crearReserva({ funcionId: 1, asientoIds: [3] }), /ya están reservados/);
});
