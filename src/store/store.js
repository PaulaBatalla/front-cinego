import { configurarControlSesion } from "../services/sesionService";
import { authService } from "../services/authService";
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

configurarControlSesion(
  () => store.getState().auth.versionSesion,
  async (version) => {
    const actual = store.getState().auth;
    if (!actual.isAuthenticated || actual.versionSesion !== version) return;
    try {
      const usuario = await authService.usuarioActual();
      if (!usuario && store.getState().auth.versionSesion === version) store.dispatch(vencerSesion());
    } catch {
      // Un error de conexión no confirma que la sesión haya vencido.
    }
  }
);
