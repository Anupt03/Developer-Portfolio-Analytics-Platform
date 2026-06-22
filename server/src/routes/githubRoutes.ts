import express from 'express';
import {
  connectGitHub,
  getGitHubAnalytics,
  refreshGitHub,
} from '../controllers/githubController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { githubConnectValidation } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
// Only developers can connect their own github
router.use(authorize('developer'));

router.post('/connect', githubConnectValidation, validateRequest, connectGitHub);
router.get('/analytics', getGitHubAnalytics);
router.post('/refresh', refreshGitHub);

export default router;
