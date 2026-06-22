import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import path from 'path';

import connectDB from './config/db.js';
import env from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/AppError.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import leetcodeRoutes from './routes/leetcodeRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';

// Connect Database
connectDB();

const app: Express = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Static Uploads Folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/recruiter', recruiterRoutes);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 404 Handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('API route not found'));
});

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('❌ Unhandled Rejection:', err.message);
  // Close server & exit process in production
  // process.exit(1); 
});
