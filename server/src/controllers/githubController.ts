import { Response } from 'express';
import githubService from '../services/githubService.js';
import { AuthRequest } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

export const connectGitHub = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { username } = req.body;
  const userId = req.user!._id.toString();

  const analytics = await githubService.fetchAndAnalyze(userId, username);

  res.json({
    success: true,
    message: 'GitHub profile analyzed successfully',
    data: analytics,
  });
});

export const getGitHubAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const analytics = await githubService.getAnalytics(userId);

  if (!analytics) {
    res.status(404).json({
      success: false,
      message: 'GitHub analytics not found. Please connect your GitHub account first.',
    });
    return;
  }

  res.json({ success: true, data: analytics });
});

export const refreshGitHub = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const existing = await githubService.getAnalytics(userId);

  if (!existing) {
    res.status(404).json({
      success: false,
      message: 'GitHub not connected. Please connect first.',
    });
    return;
  }

  const analytics = await githubService.fetchAndAnalyze(userId, existing.username);

  res.json({
    success: true,
    message: 'GitHub data refreshed successfully',
    data: analytics,
  });
});
