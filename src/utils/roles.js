// Roles del back que pueden entrar al panel de administración
const ROLES_ADMIN = ["ADMIN", "SUPER_ADMIN"];

export function esRolAdmin(rol) {
  return ROLES_ADMIN.includes(rol);
}

// A dónde va el usuario después de iniciar sesión: a la página de la que venía,
// o si no, el admin al panel y el cliente al inicio
export function destinoTrasLogin(usuario, volverA) {
  if (volverA) {
    return volverA;
  }

  return esRolAdmin(usuario?.rol) ? "/admin/peliculas" : "/";
}
