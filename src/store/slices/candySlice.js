import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { carritoService } from "../../services/carritoService";

// Trae el carrito del back. Si hay productos agregados sin sesión (marcados como local),
// primero los sube: el back suma la cantidad si el producto ya estaba en el carrito.
export const fetchCarrito = createAsyncThunk(
  "candy/fetchCarrito",
  async (_, { getState, rejectWithValue }) => {
    try {
      const locales = getState().candy.items.filter((item) => item.local);
      const resultados = await Promise.allSettled(
        locales.map((item) => carritoService.agregar(item.candyId, item.cantidad))
      );
      // Los que no se pudieron subir se conservan como locales para reintentar en la próxima carga
      const sinSubir = locales.filter((_, i) => resultados[i].status === "rejected");
      const datos = await carritoService.obtener();
      return { items: Array.isArray(datos) ? datos : [], sinSubir };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
  {
    // Al loguearse varios componentes piden el carrito a la vez: si uno ya está en curso,
    // los demás no arrancan (evita subir dos veces lo agregado sin sesión)
    condition: (_, { getState }) => !getState().candy.cargando,
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
      const res = await carritoService.actualizarCantidad(item.id, candyId, nuevaCantidad);
      return { oldId: item.id, candyId, cantidad: nuevaCantidad, itemActualizado: res };
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
          // Agregado sin sesión: se sube al back cuando el usuario se loguea
          local: true,
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
        state.items = [...action.payload.items, ...action.payload.sinSubir];
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
        const { oldId, cantidad, itemActualizado } = action.payload;
        if (cantidad <= 0 || !itemActualizado) {
          state.items = state.items.filter((i) => i.id !== oldId);
        } else {
          const index = state.items.findIndex(
            (i) => i.id === oldId || (i.candyId ?? i.id) === itemActualizado.candyId
          );
          if (index >= 0) {
            state.items[index] = itemActualizado;
          } else {
            state.items.push(itemActualizado);
          }
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
