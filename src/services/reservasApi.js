import { createApi } from "@reduxjs/toolkit/query/react";
import { solicitar } from "./api";

// Reutiliza la URL configurable, autenticación y errores del cliente compartido.
export const reservasApi = createApi({
  reducerPath: "reservasApi",
  baseQuery: async ({ ruta, ...opciones }, { signal }) => {
    try {
      const data = await solicitar(ruta, { ...opciones, signal });
      if (!opciones.method && !Array.isArray(data)) {
        return { error: { status: "CUSTOM_ERROR", message: "La respuesta del servidor no es válida." } };
      }
      return { data };
    } catch (error) {
      return { error: { status: error.status || "FETCH_ERROR", message: error.message } };
    }
  },
  tagTypes: ["MisReservas", "Asientos"],
  endpoints: (builder) => ({
    peliculas: builder.query({
      query: () => ({ ruta: "/peliculas" }),
    }),
    funciones: builder.query({
      query: () => ({ ruta: "/funciones" }),
    }),
    misReservas: builder.query({
      query: () => ({ ruta: "/reservas/mis-reservas" }),
      providesTags: ["MisReservas"],
    }),
    asientos: builder.query({
      query: (funcionId) => ({ ruta: `/funciones/${funcionId}/asientos` }),
      providesTags: (_resultado, _error, funcionId) => [{ type: "Asientos", id: String(funcionId) }],
    }),
    crearReserva: builder.mutation({
      query: ({ funcionId, asientoIds }) => ({
        ruta: "/reservas",
        method: "POST",
        body: JSON.stringify({ funcionId, asientoIds }),
      }),
      invalidatesTags: (_resultado, error, { funcionId }) => error
        ? (error.status === 409 ? [{ type: "Asientos", id: String(funcionId) }] : [])
        : ["MisReservas", { type: "Asientos", id: String(funcionId) }],
    }),
  }),
});

export const {
  usePeliculasQuery,
  useFuncionesQuery,
  useMisReservasQuery,
  useAsientosQuery,
  useCrearReservaMutation,
} = reservasApi;
