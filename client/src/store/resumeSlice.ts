import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface ResumeState {
  data: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchResumeAnalysis = createAsyncThunk(
  'resume/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/resume/analysis');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resume analysis');
    }
  }
);

export const uploadResume = createAsyncThunk(
  'resume/upload',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload resume');
    }
  }
);

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    clearResumeData: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResumeAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResumeAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchResumeAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearResumeData } = resumeSlice.actions;
export default resumeSlice.reducer;
