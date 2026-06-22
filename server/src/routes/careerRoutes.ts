import express from 'express';
import {
  getCareerInsights,
  getHiringReadiness,
} from '../controllers/careerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('developer'));

router.get('/insights', getCareerInsights);
router.get('/hiring-readiness', getHiringReadiness);

export default router;
