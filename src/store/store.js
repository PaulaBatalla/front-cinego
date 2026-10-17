import { configureStore } from "@reduxjs/toolkit";
import candyReducer from "./slices/candySlice";

export const store = configureStore({
  reducer: {
    candy: candyReducer,
  },
});