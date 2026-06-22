import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface RecruiterState {
  searchResults: {
    developers: any[];
    total: number;
    page: number;
    totalPages: number;
  };
  selectedDeveloper: any | null;
  comparisonData: any[] | null;
  savedCandidates: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RecruiterState = {
  searchResults: { developers: [], total: 0, page: 1, totalPages: 1 },
  selectedDeveloper: null,
  comparisonData: null,
  savedCandidates: [],
  isLoading: false,
  error: null,
};

export const searchDevelopers = createAsyncThunk(
  'recruiter/search',
  async (filters: any, { rejectWithValue }) => {
    try {
      const response = await api.get('/recruiter/search', { params: filters });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search developers');
    }
  }
);

export const getDeveloperProfile = createAsyncThunk(
  'recruiter/getProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/recruiter/developers/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const compareDevelopers = createAsyncThunk(
  'recruiter/compare',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await api.post('/recruiter/compare', { ids });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to compare developers');
    }
  }
);

const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState,
  reducers: {
    clearSelectedDeveloper: (state) => {
      state.selectedDeveloper = null;
    },
    clearComparison: (state) => {
      state.comparisonData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchDevelopers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchDevelopers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchDevelopers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getDeveloperProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDeveloperProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDeveloper = action.payload;
      })
      .addCase(getDeveloperProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(compareDevelopers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(compareDevelopers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comparisonData = action.payload;
      })
      .addCase(compareDevelopers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedDeveloper, clearComparison } = recruiterSlice.actions;
export default recruiterSlice.reducer;
