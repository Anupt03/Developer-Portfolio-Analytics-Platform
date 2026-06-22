import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import githubReducer from './githubSlice';
import leetcodeReducer from './leetcodeSlice';
import resumeReducer from './resumeSlice';
import careerReducer from './careerSlice';
import recruiterReducer from './recruiterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    github: githubReducer,
    leetcode: leetcodeReducer,
    resume: resumeReducer,
    career: careerReducer,
    recruiter: recruiterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
