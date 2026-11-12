import { configurarSesionVencida } from "../services/sesionService";
import { configureStore } from "@reduxjs/toolkit";
import candyReducer from "./slices/candySlice";
import authReducer, { loginUser, logout, vencerSesion } from "./slices/authSlice";
import { reservasApi } from "../services/reservasApi";

const limpiarReservasAlCambiarSesion = ({ dispatch }) => (next) => (action) => {
  const resultado = next(action);
  if (logout.match(action) || vencerSesion.match(action) || loginUser.pending.match(action)) {
    dispatch(reservasApi.util.resetApiState());
  }
  return resultado;
};

export const store = configureStore({
  reducer: {
    candy: candyReducer,
    auth: authReducer,
    [reservasApi.reducerPath]: reservasApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(limpiarReservasAlCambiarSesion, reservasApi.middleware),
});

configurarSesionVencida((token) => {
  // Una respuesta de una sesión anterior no debe cerrar la sesión nueva.
  if (store.getState().auth.token !== token) return;
  localStorage.removeItem("token");
  store.dispatch(vencerSesion());
});
