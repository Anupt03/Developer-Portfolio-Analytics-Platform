import { Response } from 'express';
import leetcodeService from '../services/leetcodeService.js';
import { AuthRequest } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

export const connectLeetCode = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { username } = req.body;
  const userId = req.user!._id.toString();

  const analytics = await leetcodeService.fetchAndAnalyze(userId, username);

  res.json({
    success: true,
    message: 'LeetCode profile analyzed successfully',
    data: analytics,
  });
});

export const getLeetCodeAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const analytics = await leetcodeService.getAnalytics(userId);

  if (!analytics) {
    res.status(404).json({
      success: false,
      message: 'LeetCode analytics not found. Please connect your LeetCode account first.',
    });
    return;
  }

  res.json({ success: true, data: analytics });
});
