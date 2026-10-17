import { createSlice } from "@reduxjs/toolkit";

const candySlice = createSlice({
  name: "candy",

  initialState: {
    items: [],
  },

  reducers: {
    agregarCandy: (state, action) => {
      const producto = action.payload;

      const existente = state.items.find(
        (item) => item.id === producto.id
      );

      if (!existente) {
        state.items.push(producto);
      }
    },

    quitarCandy: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },

    vaciarCandy: (state) => {
      state.items = [];
    },
  },
});

export const { agregarCandy, quitarCandy, vaciarCandy } =
  candySlice.actions;

export default candySlice.reducer;