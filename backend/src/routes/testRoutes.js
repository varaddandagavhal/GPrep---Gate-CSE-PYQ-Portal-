import express from 'express';
import * as testController from '../controllers/testController.js';
import { authenticate, isStudent } from '../middlewares/auth.js';

const router = express.Router();

// All test routes require student authentication
router.use(authenticate, isStudent);

/**
 * Test Routes
 * Note: static routes must come before parameterized routes
 */
router.post('/start', testController.startTest);
router.get('/history', testController.getUserTestHistory);
router.get('/:testId', testController.getTestDetails);
router.post('/:testId/answer', testController.saveAnswer);
router.post('/:testId/submit', testController.submitTest);
router.post('/:testId/violation', testController.recordViolation);
router.get('/:testId/results', testController.getTestResults);

export default router;
