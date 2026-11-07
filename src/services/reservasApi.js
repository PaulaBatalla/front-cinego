import { createApi } from "@reduxjs/toolkit/query/react";
import { solicitar } from "./api";

// Reutiliza la URL configurable, autenticación y errores del cliente compartido.
export const reservasApi = createApi({
  reducerPath: "reservasApi",
  baseQuery: async ({ ruta, esLista = true, ...opciones }, { signal }) => {
    try {
      const data = await solicitar(ruta, { ...opciones, signal });
      if (!opciones.method && (esLista ? !Array.isArray(data) : !data || typeof data !== "object" || Array.isArray(data))) {
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
    pelicula: builder.query({
      query: (id) => ({ ruta: `/peliculas/${encodeURIComponent(id)}`, esLista: false }),
    }),
    funciones: builder.query({
      query: () => ({ ruta: "/funciones" }),
    }),
    misReservas: builder.query({
      query: () => ({ ruta: "/reservas/mis-reservas" }),
      providesTags: ["MisReservas"],
    }),
    reserva: builder.query({
      query: (id) => ({ ruta: `/reservas/${encodeURIComponent(id)}`, esLista: false }),
      providesTags: ["MisReservas"],
    }),
    asientos: builder.query({
      query: (funcionId) => ({ ruta: `/funciones/${funcionId}/asientos` }),
      providesTags: (_resultado, _error, funcionId) => [{ type: "Asientos", id: String(funcionId) }],
    }),
    confirmarReserva: builder.mutation({
      query: ({ idReserva }) => ({ ruta: `/reservas/${encodeURIComponent(idReserva)}/confirmar`, method: "PATCH" }),
      invalidatesTags: ["MisReservas", "Asientos"],
    }),
    cancelarReserva: builder.mutation({
      query: ({ idReserva }) => ({ ruta: `/reservas/${encodeURIComponent(idReserva)}/cancelar`, method: "PATCH" }),
      invalidatesTags: (_resultado, error, { funcionId }) => !error || [400, 409].includes(error.status)
        ? ["MisReservas", { type: "Asientos", id: String(funcionId) }] : [],
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
  usePeliculaQuery,
  useFuncionesQuery,
  useMisReservasQuery,
  useLazyMisReservasQuery,
  useReservaQuery,
  useAsientosQuery,
  useCrearReservaMutation,
  useCancelarReservaMutation,
  useConfirmarReservaMutation,
} = reservasApi;
