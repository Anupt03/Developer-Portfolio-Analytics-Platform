import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import resumeService from '../services/resumeService.js';
import { AuthRequest } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

// Multer config for PDF uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only PDF files are allowed') as any, false);
    }
  },
});

export const uploadResume = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    return;
  }

  const userId = req.user!._id.toString();
  const analysis = await resumeService.analyzeResume(
    userId,
    req.file.path,
    req.file.originalname
  );

  res.json({
    success: true,
    message: 'Resume analyzed successfully',
    data: analysis,
  });
});

export const getResumeAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const analysis = await resumeService.getAnalysis(userId);

  if (!analysis) {
    res.status(404).json({
      success: false,
      message: 'No resume analysis found. Please upload your resume first.',
    });
    return;
  }

  res.json({ success: true, data: analysis });
});
