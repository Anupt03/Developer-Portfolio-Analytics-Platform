import express from 'express';
import {
  searchDevelopers,
  getDeveloperProfile,
  compareDevelopers,
  getSearchHistory,
} from '../controllers/recruiterController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { recruiterSearchValidation } from '../utils/validators.js';

const router = express.Router();

// Only recruiters can access these routes
router.use(protect);
router.use(authorize('recruiter'));

router.get('/search', recruiterSearchValidation, validateRequest, searchDevelopers);
router.get('/developers/:id', getDeveloperProfile);
router.post('/compare', compareDevelopers);
router.get('/saved', getSearchHistory);

export default router;
