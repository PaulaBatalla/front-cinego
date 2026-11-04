import { configureStore } from "@reduxjs/toolkit";
import candyReducer from "./slices/candySlice";
import authReducer from "./slices/authSlice";

import { reservasApi } from "../services/reservasApi";
import { loginUser, logout } from "./slices/authSlice";

const limpiarReservasAlCambiarSesion = ({ dispatch }) => (next) => (action) => {
  const resultado = next(action);
  if (logout.match(action) || loginUser.pending.match(action)) {
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