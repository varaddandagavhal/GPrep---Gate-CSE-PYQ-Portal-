import express from 'express';
import * as questionController from '../controllers/questionController.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';
import { validate, subjectSchema, topicSchema, questionSchema } from '../validators/schemas.js';

const router = express.Router();

// ==================== Subject Routes ====================
router.get('/subjects', questionController.getAllSubjects);
router.get('/subjects/:id', questionController.getSubjectById);
router.post('/subjects', authenticate, isAdmin, validate(subjectSchema), questionController.createSubject);
router.put('/subjects/:id', authenticate, isAdmin, validate(subjectSchema), questionController.updateSubject);
router.delete('/subjects/:id', authenticate, isAdmin, questionController.deleteSubject);

// ==================== Topic Routes ====================
router.get('/topics/subject/:subjectId', questionController.getTopicsBySubject);
router.post('/topics', authenticate, isAdmin, validate(topicSchema), questionController.createTopic);
router.put('/topics/:id', authenticate, isAdmin, validate(topicSchema), questionController.updateTopic);
router.delete('/topics/:id', authenticate, isAdmin, questionController.deleteTopic);

// ==================== Question Routes ====================
router.get('/questions', questionController.getAllQuestions);
router.get('/questions/:id', questionController.getQuestionById);
router.post('/questions', authenticate, isAdmin, validate(questionSchema), questionController.createQuestion);
router.put('/questions/:id', authenticate, isAdmin, validate(questionSchema), questionController.updateQuestion);
router.delete('/questions/:id', authenticate, isAdmin, questionController.deleteQuestion);

export default router;
