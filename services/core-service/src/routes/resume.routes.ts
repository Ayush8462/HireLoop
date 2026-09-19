import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createResume,
  getMyResumes,
  getResumeById,
  updateResume,
  deleteResume,
  setDefaultResume
} from '../controllers/resume.controller.js';
import {
  createResumeSchema,
  updateResumeSchema,
  resumeIdSchema,
  getResumesSchema
} from '../validators/resume.validator.js';

const router = Router();

router.post('/', authenticate, validate(createResumeSchema), createResume);
router.get('/', authenticate, validate(getResumesSchema), getMyResumes);
router.patch('/:id/default', authenticate, validate(resumeIdSchema), setDefaultResume);
router.get('/:id', authenticate, validate(resumeIdSchema), getResumeById);
router.patch('/:id', authenticate, validate(updateResumeSchema), updateResume);
router.delete('/:id', authenticate, validate(resumeIdSchema), deleteResume);

export default router;
