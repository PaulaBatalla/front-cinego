import { configureStore } from "@reduxjs/toolkit";
import candyReducer from "./slices/candySlice";
import { reservasApi } from "../services/reservasApi";

export const store = configureStore({
  reducer: {
    candy: candyReducer,
    [reservasApi.reducerPath]: reservasApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(reservasApi.middleware),
});
