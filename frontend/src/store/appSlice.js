import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../services/api.js';

export const fetchDashboard = createAsyncThunk('app/dashboard', async () => {
  const { data } = await api.get('/analytics/dashboard');
  return data.stats;
});

export const fetchFeed = createAsyncThunk('app/feed', async () => {
  const { data } = await api.get('/jobs/feed');
  return data;
});

export const fetchJobs = createAsyncThunk('app/jobs', async (params = {}) => {
  const { data } = await api.get('/jobs', { params });
  return data.jobs;
});

export const fetchNotifications = createAsyncThunk('app/notifications', async () => {
  const { data } = await api.get('/notifications');
  return data.notifications;
});

const appSlice = createSlice({
  name: 'app',
  initialState: {
    stats: {},
    feed: {},
    jobs: [],
    notifications: [],
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
        state.loading = true;
      })
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state, action) => {
        state.loading = false;
        if (action.type.includes('dashboard')) state.stats = action.payload;
        if (action.type.includes('feed')) state.feed = action.payload;
        if (action.type.includes('jobs')) state.jobs = action.payload;
        if (action.type.includes('notifications')) state.notifications = action.payload;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state) => {
        state.loading = false;
      });
  }
});

export default appSlice.reducer;
