import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';
import { asyncHandler, sendResponse, AppError } from '../utils/errors.js';

// ==================== Subject Controllers ====================

/**
 * Get all subjects
 */
export const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find();
  sendResponse(res, 200, 'Subjects retrieved', subjects);
});

/**
 * Get subject by ID
 */
export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  sendResponse(res, 200, 'Subject retrieved', subject);
});

/**
 * Create subject (Admin only)
 */
export const createSubject = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  const subjectExists = await Subject.findOne({ $or: [{ name }, { code }] });
  if (subjectExists) {
    throw new AppError('Subject already exists', 400);
  }

  const subject = await Subject.create({ name, code });
  sendResponse(res, 201, 'Subject created successfully', subject);
});

/**
 * Update subject (Admin only)
 */
export const updateSubject = asyncHandler(async (req, res) => {
  const { name, code } = req.body;
  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { name, code },
    { new: true, runValidators: true }
  );

  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  sendResponse(res, 200, 'Subject updated successfully', subject);
});

/**
 * Delete subject (Admin only)
 */
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  sendResponse(res, 200, 'Subject deleted successfully');
});

// ==================== Topic Controllers ====================

/**
 * Get all topics for a subject
 */
export const getTopicsBySubject = asyncHandler(async (req, res) => {
  const topics = await Topic.find({ subjectId: req.params.subjectId });
  sendResponse(res, 200, 'Topics retrieved', topics);
});

/**
 * Create topic (Admin only)
 */
export const createTopic = asyncHandler(async (req, res) => {
  const { name, subjectId } = req.body;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  const topic = await Topic.create({ name, subjectId });
  sendResponse(res, 201, 'Topic created successfully', topic);
});

/**
 * Update topic (Admin only)
 */
export const updateTopic = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const topic = await Topic.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );

  if (!topic) {
    throw new AppError('Topic not found', 404);
  }

  sendResponse(res, 200, 'Topic updated successfully', topic);
});

/**
 * Delete topic (Admin only)
 */
export const deleteTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findByIdAndDelete(req.params.id);
  if (!topic) {
    throw new AppError('Topic not found', 404);
  }
  sendResponse(res, 200, 'Topic deleted successfully');
});

// ==================== Question Controllers ====================

/**
 * Get all questions with filters
 */
export const getAllQuestions = asyncHandler(async (req, res) => {
  const { subjectId, topicId, year, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (subjectId) filter.subjectId = subjectId;
  if (topicId) filter.topicId = topicId;
  if (year) filter.year = year;

  const skip = (page - 1) * limit;
  const questions = await Question.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('subjectId', 'name')
    .populate('topicId', 'name');

  const total = await Question.countDocuments(filter);

  sendResponse(res, 200, 'Questions retrieved', {
    questions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: parseInt(page),
    },
  });
});

/**
 * Get question by ID
 */
export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate('subjectId', 'name')
    .populate('topicId', 'name');

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  sendResponse(res, 200, 'Question retrieved', question);
});

/**
 * Create question (Admin only)
 */
export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create(req.body);
  await question.populate('subjectId', 'name');
  await question.populate('topicId', 'name');
  sendResponse(res, 201, 'Question created successfully', question);
});

/**
 * Update question (Admin only)
 */
export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('subjectId', 'name')
    .populate('topicId', 'name');

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  sendResponse(res, 200, 'Question updated successfully', question);
});

/**
 * Delete question (Admin only)
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) {
    throw new AppError('Question not found', 404);
  }
  sendResponse(res, 200, 'Question deleted successfully');
});
