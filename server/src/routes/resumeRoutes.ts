import express from 'express';
import {
  uploadResume,
  getResumeAnalysis,
  upload,
} from '../controllers/resumeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('developer'));

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/analysis', getResumeAnalysis);

export default router;
