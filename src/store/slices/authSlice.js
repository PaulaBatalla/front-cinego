import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

function leerUsuario(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const datos = JSON.parse(atob(base64));

    if (datos.exp * 1000 < Date.now()) {
      return null;
    }

    return { email: datos.sub, rol: datos.rol };
  } catch {
    return null;
  }
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
      localStorage.setItem("token", token);
      return token;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    ...armarSesion(localStorage.getItem("token")),
    isLoading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
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
        const sesion = armarSesion(action.payload);

        state.token = sesion.token;
        state.usuario = sesion.usuario;
        state.isAuthenticated = sesion.isAuthenticated;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
