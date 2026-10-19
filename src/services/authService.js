import { API_URL as API_BASE } from "./api";
const API_URL = `${API_BASE}/usuarios`;

async function enviar(ruta, datos) {
  try {
    return await fetch(`${API_URL}${ruta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
  } catch {
    // fetch falla así cuando no llega al servidor (back apagado o CORS)
    throw new Error("No se pudo conectar con el servidor.");
  }
}

export const authService = {
  // Devuelve el JWT si las credenciales son correctas
  login: async (email, password) => {
    const respuesta = await enviar("/login", { email: email.trim(), password });

    if (respuesta.status === 401 || respuesta.status === 403) {
      throw new Error("Email o contraseña incorrectos.");
    }

    if (!respuesta.ok) {
      throw new Error(`No se pudo iniciar sesión (${respuesta.status})`);
    }

    // El back devuelve el JWT como texto plano, no como JSON
    return respuesta.text();
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
