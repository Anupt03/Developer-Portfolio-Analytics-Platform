import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface CareerState {
  insights: any[] | null;
  readiness: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CareerState = {
  insights: null,
  readiness: null,
  isLoading: false,
  error: null,
};

export const fetchCareerInsights = createAsyncThunk(
  'career/fetchInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/career/insights');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch insights');
    }
  }
);

export const fetchHiringReadiness = createAsyncThunk(
  'career/fetchReadiness',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/career/hiring-readiness');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch readiness');
    }
  }
);

const careerSlice = createSlice({
  name: 'career',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCareerInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCareerInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.insights = action.payload;
      })
      .addCase(fetchCareerInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHiringReadiness.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHiringReadiness.fulfilled, (state, action) => {
        state.isLoading = false;
        state.readiness = action.payload;
      })
      .addCase(fetchHiringReadiness.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default careerSlice.reducer;
