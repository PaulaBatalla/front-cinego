import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

export const verificarSesion = createAsyncThunk(
  "auth/verificarSesion",
  async () => authService.usuarioActual(),
  { condition: (_, { getState }) => !getState().auth.verificacionIniciada }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await authService.login(email, password);
      const usuario = await authService.usuarioActual();
      if (!usuario) throw new Error("No se pudo recuperar la sesión. Intentá nuevamente.");
      return { usuario };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    usuario: null, isAuthenticated: false, sesionVencida: false,
    verificandoSesion: true, verificacionIniciada: false, errorVerificacion: null,
    isLoading: false, error: null, versionSesion: 0,
  },
  reducers: {
    vencerSesion: (state) => {
      state.usuario = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.sesionVencida = true;
      state.versionSesion += 1;
    },
    logout: (state) => {
      state.usuario = null;
      state.isAuthenticated = false;
      state.sesionVencida = false;
      state.error = null;
      state.versionSesion += 1;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verificarSesion.pending, (state) => {
        state.verificacionIniciada = true;
        state.verificandoSesion = true;
        state.errorVerificacion = null;
      })
      .addCase(verificarSesion.fulfilled, (state, action) => {
        state.usuario = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.verificandoSesion = false;
        state.verificacionIniciada = false;
      })
      .addCase(verificarSesion.rejected, (state) => {
        state.verificandoSesion = false;
        state.verificacionIniciada = false;
        state.errorVerificacion = "No pudimos comprobar tu sesión. Revisá la conexión e intentá de nuevo.";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.versionSesion += 1;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.sesionVencida = false;
        state.usuario = action.payload.usuario;
        state.isAuthenticated = true;
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
