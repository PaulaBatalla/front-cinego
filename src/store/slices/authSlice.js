import { leerToken, tokenVigente } from "../../utils/sesion";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

function leerUsuario(token) {
  const datos = leerToken(token);
  return tokenVigente(token) ? { email: datos.sub, rol: datos.rol } : null;
}

function armarSesion(token) {
  const usuario = token ? leerUsuario(token) : null;

  return { token, usuario, isAuthenticated: Boolean(usuario) };
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const token = await authService.login(email, password);
      if (!tokenVigente(token)) throw new Error("El servidor devolvió una sesión inválida o vencida.");
      localStorage.setItem("token", token);
      return { token, usuario: leerUsuario(token) };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    ...armarSesion(localStorage.getItem("token")),
    sesionVencida: false,
    isLoading: false,
    error: null,
  },

  reducers: {
    vencerSesion: (state) => {
      state.token = null;
      state.usuario = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.sesionVencida = true;
    },

    logout: (state) => {
      state.sesionVencida = false;
      state.token = null;
      state.usuario = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.sesionVencida = false;
        state.token = action.payload.token;
        state.usuario = action.payload.usuario;
        state.isAuthenticated = Boolean(action.payload.usuario);
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, vencerSesion } = authSlice.actions;

export default authSlice.reducer;
