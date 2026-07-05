import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import appReducer from './appSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer
  }
});
