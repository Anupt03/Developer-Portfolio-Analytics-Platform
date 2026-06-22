import { Response } from 'express';
import recruiterService from '../services/recruiterService.js';
import { AuthRequest } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

export const searchDevelopers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const recruiterId = req.user!._id.toString();
  const { skills, minScore, maxScore, location, query: searchQuery } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;

  const filters = {
    skills: skills ? (skills as string).split(',').map((s) => s.trim()) : undefined,
    minScore: minScore ? parseInt(minScore as string) : undefined,
    maxScore: maxScore ? parseInt(maxScore as string) : undefined,
    location: location as string,
    query: searchQuery as string,
  };

  const result = await recruiterService.searchDevelopers(recruiterId, filters, page, limit);
  res.json({ success: true, data: result });
});

export const getDeveloperProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const profile = await recruiterService.getDeveloperProfile(id);

  if (!profile) {
    res.status(404).json({ success: false, message: 'Developer profile not found' });
    return;
  }

  res.json({ success: true, data: profile });
});

export const compareDevelopers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length < 2) {
    res.status(400).json({
      success: false,
      message: 'Please provide at least 2 developer IDs to compare',
    });
    return;
  }

  const comparison = await recruiterService.compareDevelopers(ids);
  res.json({ success: true, data: comparison });
});

export const getSearchHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const recruiterId = req.user!._id.toString();
  const history = await recruiterService.getSavedCandidates(recruiterId);
  res.json({ success: true, data: history });
});
