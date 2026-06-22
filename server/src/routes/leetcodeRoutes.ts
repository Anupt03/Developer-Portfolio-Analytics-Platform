import express from 'express';
import {
  connectLeetCode,
  getLeetCodeAnalytics,
} from '../controllers/leetcodeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { leetcodeConnectValidation } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
// Only developers can connect their own leetcode
router.use(authorize('developer'));

router.post('/connect', leetcodeConnectValidation, validateRequest, connectLeetCode);
router.get('/analytics', getLeetCodeAnalytics);

export default router;
