import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { carritoService } from "../../services/carritoService";

export const fetchCarrito = createAsyncThunk(
  "candy/fetchCarrito",
  async (_, { rejectWithValue }) => {
    try {
      const datos = await carritoService.obtener();
      return datos;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const agregarItemCarrito = createAsyncThunk(
  "candy/agregarItemCarrito",
  async ({ producto, cantidad = 1, isAuthenticated }, { dispatch, rejectWithValue }) => {
    if (!isAuthenticated) {
      dispatch(agregarCandyLocal(producto));
      return null;
    }
    try {
      const candyId = producto.candyId ?? producto.id;
      const res = await carritoService.agregar(candyId, cantidad);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const disminuirItemCarrito = createAsyncThunk(
  "candy/disminuirItemCarrito",
  async ({ item, isAuthenticated }, { dispatch, rejectWithValue }) => {
    const candyId = item.candyId ?? item.id;
    if (!isAuthenticated) {
      dispatch(disminuirCandyLocal(candyId));
      return null;
    }
    try {
      const nuevaCantidad = item.cantidad - 1;
      await carritoService.actualizarCantidad(item.id, candyId, nuevaCantidad);
      return { id: item.id, candyId, cantidad: nuevaCantidad };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const quitarItemCarrito = createAsyncThunk(
  "candy/quitarItemCarrito",
  async ({ item, isAuthenticated }, { dispatch, rejectWithValue }) => {
    if (!isAuthenticated) {
      dispatch(quitarCandyLocal(item.candyId ?? item.id));
      return null;
    }
    try {
      await carritoService.eliminar(item.id);
      return item.id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const vaciarPedidoCarrito = createAsyncThunk(
  "candy/vaciarPedidoCarrito",
  async ({ items, isAuthenticated }, { dispatch, rejectWithValue }) => {
    if (!isAuthenticated) {
      dispatch(vaciarCandyLocal());
      return null;
    }
    try {
      await carritoService.vaciar(items);
      return null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const candySlice = createSlice({
  name: "candy",

  initialState: {
    items: [],
    cargando: false,
    error: null,
  },

  reducers: {
    agregarCandyLocal: (state, action) => {
      const producto = action.payload;
      const candyId = producto.candyId ?? producto.id;
      const existente = state.items.find(
        (item) => (item.candyId ?? item.id) === candyId
      );

      if (existente) {
        existente.cantidad += 1;
      } else {
        state.items.push({
          id: producto.id,
          candyId: candyId,
          nombre: producto.nombre,
          precio: producto.precio,
          imagenUrl: producto.imagenUrl || null,
          color: producto.color,
          icono: producto.icono,
          categoria: producto.categoria,
          cantidad: 1,
        });
      }
    },

    quitarCandyLocal: (state, action) => {
      const idTarget = action.payload;
      state.items = state.items.filter(
        (item) => (item.candyId ?? item.id) !== idTarget && item.id !== idTarget
      );
    },

    disminuirCandyLocal: (state, action) => {
      const idTarget = action.payload;
      const existente = state.items.find(
        (item) => (item.candyId ?? item.id) === idTarget || item.id === idTarget
      );

      if (!existente) return;

      if (existente.cantidad > 1) {
        existente.cantidad -= 1;
      } else {
        state.items = state.items.filter(
          (item) => (item.candyId ?? item.id) !== idTarget && item.id !== idTarget
        );
      }
    },

    vaciarCandyLocal: (state) => {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchCarrito
      .addCase(fetchCarrito.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.cargando = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // agregarItemCarrito
      .addCase(agregarItemCarrito.fulfilled, (state, action) => {
        if (!action.payload) return;
        const itemActualizado = action.payload;
        const index = state.items.findIndex(
          (i) => (i.candyId ?? i.id) === itemActualizado.candyId
        );
        if (index >= 0) {
          state.items[index] = itemActualizado;
        } else {
          state.items.push(itemActualizado);
        }
      })
      // disminuirItemCarrito
      .addCase(disminuirItemCarrito.fulfilled, (state, action) => {
        if (!action.payload) return;
        const { id, cantidad } = action.payload;
        if (cantidad <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          const item = state.items.find((i) => i.id === id);
          if (item) item.cantidad = cantidad;
        }
      })
      // quitarItemCarrito
      .addCase(quitarItemCarrito.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      // vaciarPedidoCarrito
      .addCase(vaciarPedidoCarrito.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const {
  agregarCandyLocal,
  quitarCandyLocal,
  disminuirCandyLocal,
  vaciarCandyLocal,
} = candySlice.actions;

// Aliases para compatibilidad
export const agregarCandy = agregarCandyLocal;
export const quitarCandy = quitarCandyLocal;
export const disminuirCandy = disminuirCandyLocal;
export const vaciarCandy = vaciarCandyLocal;

export default candySlice.reducer;
