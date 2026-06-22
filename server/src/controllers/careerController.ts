import { Response } from 'express';
import aiService from '../services/aiService.js';
import { AuthRequest } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCareerInsights = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const insights = await aiService.generateInsights(userId);

  res.json({ success: true, data: insights });
});

export const getHiringReadiness = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const readiness = await aiService.getHiringReadiness(userId);

  res.json({ success: true, data: readiness });
});
