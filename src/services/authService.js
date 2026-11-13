import { API_URL } from "./api";

async function enviar(ruta, datos) {
  try {
    return await fetch(`${API_URL}/usuarios${ruta}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(datos ? { body: JSON.stringify(datos) } : {}),
    });
  } catch {
    // fetch falla así cuando no llega al servidor (back apagado o CORS)
    throw new Error("No se pudo conectar con el servidor.");
  }
}

export const authService = {
  login: async (email, password) => {
    const respuesta = await enviar("/login", { email: email.trim(), password });

    if (respuesta.status === 401 || respuesta.status === 403) {
      throw new Error("Email o contraseña incorrectos.");
    }

    if (!respuesta.ok) {
      throw new Error(`No se pudo iniciar sesión (${respuesta.status})`);
    }

  },

  usuarioActual: async () => {
    let respuesta;
    try {
      respuesta = await fetch(`${API_URL}/usuarios/me`, { credentials: "include" });
    } catch {
      throw new Error("No se pudo conectar con el servidor.");
    }
    if (respuesta.status === 401 || respuesta.status === 403) return null;
    if (!respuesta.ok) throw new Error(`No se pudo consultar la sesión (${respuesta.status}).`);
    return respuesta.json();
  },

  logout: async () => {
    const respuesta = await enviar("/logout");
    if (!respuesta.ok) throw new Error("No se pudo cerrar sesión. Intentá nuevamente.");
  },

  registrar: async (datos) => {
    const respuesta = await enviar("/registro", {
      email: datos.email.trim(),
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      password: datos.password,
      fechaNacimiento: datos.fechaNacimiento,
      sexo: datos.sexo,
    });

    if (respuesta.status === 400) {
      // El back manda el motivo como texto (ej: email ya registrado)
      throw new Error(await respuesta.text());
    }

    if (!respuesta.ok) {
      throw new Error(`No se pudo crear la cuenta (${respuesta.status})`);
    }
  },
};
