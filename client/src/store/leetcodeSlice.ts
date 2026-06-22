import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface LeetCodeState {
  data: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LeetCodeState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchLeetCodeAnalytics = createAsyncThunk(
  'leetcode/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leetcode/analytics');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch LeetCode analytics');
    }
  }
);

export const connectLeetCode = createAsyncThunk(
  'leetcode/connect',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/leetcode/connect', { username });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to connect LeetCode');
    }
  }
);

const leetcodeSlice = createSlice({
  name: 'leetcode',
  initialState,
  reducers: {
    clearLeetCodeData: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeetCodeAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeetCodeAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchLeetCodeAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(connectLeetCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectLeetCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(connectLeetCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLeetCodeData } = leetcodeSlice.actions;
export default leetcodeSlice.reducer;
