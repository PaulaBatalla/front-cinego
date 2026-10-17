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

            if (existente) {
                existente.cantidad += 1;
            } else {
                state.items.push({
                    ...producto,
                    cantidad: 1,
                });
            }
        },

        quitarCandy: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );
        },

        disminuirCandy: (state, action) => {
            const existente = state.items.find(
                (item) => item.id === action.payload
            );

            if (!existente) return;

            if (existente.cantidad > 1) {
                existente.cantidad -= 1;
            } else {
                state.items = state.items.filter(
                    (item) => item.id !== action.payload
                );
            }
        },

        vaciarCandy: (state) => {
            state.items = [];
        },
    },
});

export const {
    agregarCandy,
    disminuirCandy,
    quitarCandy,
    vaciarCandy,
} = candySlice.actions;

export default candySlice.reducer;