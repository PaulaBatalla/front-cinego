import { configureStore } from "@reduxjs/toolkit";
import candyReducer from "./slices/candySlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    candy: candyReducer,
    auth: authReducer,
  },
});