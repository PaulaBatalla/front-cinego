# Front CineGo.

Mock-Up del sitio: https://drive.google.com/file/d/1_dkXs4EPsHP8sRHzlttIHZYEh35foRby/view?usp=sharing

## Reservas con el backend

Iniciar el backend de `../../uade-appsinteractivas` en el puerto 8080 y ejecutar `npm install` y `npm run dev` en este proyecto. Vite redirige `/api` al backend durante desarrollo.

Iniciar sesión, elegir una película y una función, pulsar **Elegir asientos** y luego **Confirmar reserva**. También se puede entrar por `/reservas`. Los asientos ocupados se consultan por función y las reservas se crean con el JWT del usuario; el servidor calcula el total. La confirmación muestra el número y el estado real de la reserva.

El backend debe incluir `GET /api/funciones/{id}/asientos`, que devuelve objetos `{ id, fila, numero, ocupado }`, además de `POST /api/reservas`, que recibe `{ funcionId, asientoIds }`.

Para otro servidor, definir `VITE_API_URL` (por ejemplo, `https://servidor/api`) y permitir el origen del front en ese servidor. En producción, si no se define esa variable, configurar el hosting para redirigir `/api` al backend.
