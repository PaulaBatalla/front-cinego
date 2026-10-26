# CineGo — Frontend

Aplicación web para consultar la cartelera de cine, elegir funciones y reservar entradas. Desarrollada con React y Vite, con una interfaz adaptable a escritorio y celulares.

## Funcionalidades

- Cartelera con búsqueda de películas.
- Consulta de funciones por película, día y sala.
- Registro e inicio de sesión.
- Selección de asientos y confirmación de reservas.
- Historial de reservas del usuario, con estado, función, cantidad de entradas y total. Requiere iniciar sesión.
- Catálogo de Candy con filtros por categoría.

## Tecnologías

- React 19 y Vite 8.
- React Router.
- Redux Toolkit y React Redux.
- CSS y ESLint.

## Ejecución local

Se necesita Node.js compatible con Vite 8 y npm. Para consultar películas, funciones y reservas, también debe estar en ejecución la API de CineGo.

```bash
npm install
npm run dev
```

Abrir la dirección que indique Vite en la terminal, habitualmente `http://localhost:5173`.

### Conexión con la API

Por defecto, el frontend realiza las solicitudes a `/api`. Durante el desarrollo, Vite redirige esas solicitudes al backend en `http://localhost:8080`, según la configuración de `vite.config.js`.

Para utilizar otra dirección, crear un archivo `.env.local` en la raíz del proyecto:

```dotenv
VITE_API_URL=http://localhost:8080/api
```

Reiniciar el servidor de desarrollo después de modificar las variables de entorno. Si la API está en otro origen, el backend debe permitir el origen del frontend mediante CORS.

En producción, configurar `VITE_API_URL` antes de compilar o configurar el servidor para redirigir `/api` al backend. El proxy de Vite solo se aplica al servidor de desarrollo.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera la aplicación de producción en `dist/`. |
| `npm run preview` | Permite previsualizar la compilación localmente. |
| `npm run lint` | Ejecuta ESLint. |

## Estructura

| Directorio | Contenido |
| --- | --- |
| `src/components/` | Componentes de interfaz y formularios. |
| `src/context/` | Contexto de autenticación. |
| `src/data/` | Datos locales. |
| `src/hooks/` | Hooks compartidos. |
| `src/pages/` | Páginas de funciones y reservas. |
| `src/services/` | Comunicación con la API. |
| `src/store/` | Estado global con Redux. |
| `src/styles/` | Estilos compartidos y de páginas. |
| `src/utils/` | Validaciones y utilidades. |

## Diseño

[Mockup del sitio](https://drive.google.com/file/d/1_dkXs4EPsHP8sRHzlttIHZYEh35foRby/view?usp=sharing)
