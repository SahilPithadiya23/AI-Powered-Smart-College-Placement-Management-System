import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, clearSession, setSession } from '../services/api.js';

const savedUser = localStorage.getItem('user');

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export const login = createAsyncThunk('auth/login', async (payload) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    setSession(data);
    return data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
});

export const register = createAsyncThunk('auth/register', async (payload) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    setSession(data);
    return data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    loading: false,
    error: null
  },
  reducers: {
    logout(state) {
      clearSession();
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
