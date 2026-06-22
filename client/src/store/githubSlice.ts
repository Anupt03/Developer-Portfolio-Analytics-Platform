import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface GitHubState {
  data: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GitHubState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchGitHubAnalytics = createAsyncThunk(
  'github/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/github/analytics');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch GitHub analytics');
    }
  }
);

export const connectGitHub = createAsyncThunk(
  'github/connect',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/github/connect', { username });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to connect GitHub');
    }
  }
);

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    clearGitHubData: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGitHubAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGitHubAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchGitHubAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(connectGitHub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectGitHub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(connectGitHub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGitHubData } = githubSlice.actions;
export default githubSlice.reducer;
