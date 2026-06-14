import TestAttempt from '../models/TestAttempt.js';
import Question from '../models/Question.js';
import { asyncHandler, sendResponse, AppError } from '../utils/errors.js';

/**
 * Start a new test
 */
export const startTest = asyncHandler(async (req, res) => {
  const { questionIds } = req.body;

  if (!questionIds || !Array.isArray(questionIds)) {
    throw new AppError('Invalid question IDs', 400);
  }

  const questions = await Question.find({ _id: { $in: questionIds } });

  if (questions.length !== questionIds.length) {
    throw new AppError('Some questions not found', 404);
  }

  const maxScore = questions.reduce((sum, q) => sum + q.marks, 0);

  const testAttempt = await TestAttempt.create({
    userId: req.user.userId,
    questions: questionIds.map((qId) => ({ questionId: qId })),
    maxScore,
    startTime: new Date(),
  });

  sendResponse(res, 201, 'Test started successfully', {
    testId: testAttempt._id,
    maxScore,
    totalQuestions: questions.length,
  });
});

/**
 * Get test details
 */
export const getTestDetails = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const testAttempt = await TestAttempt.findById(testId).populate({
    path: 'questions.questionId',
    select: 'questionText options marks year',
  });

  if (!testAttempt) {
    throw new AppError('Test not found', 404);
  }

  if (testAttempt.userId.toString() !== req.user.userId) {
    throw new AppError('Unauthorized', 403);
  }

  // Don't expose correct answers during the test
  if (testAttempt.status === 'in-progress') {
    testAttempt.questions = testAttempt.questions.map((q) => ({
      questionId: q.questionId._id,
      questionText: q.questionId.questionText,
      options: q.questionId.options,
      marks: q.questionId.marks,
      selectedOption: q.selectedOption,
      isMarkedForReview: q.isMarkedForReview,
      timeSpent: q.timeSpent,
    }));
  }

  sendResponse(res, 200, 'Test details retrieved', testAttempt);
});

/**
 * Save question answer
 */
export const saveAnswer = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { questionId, selectedOption, timeSpent, isMarkedForReview } = req.body;

  const testAttempt = await TestAttempt.findById(testId);

  if (!testAttempt) {
    throw new AppError('Test not found', 404);
  }

  if (testAttempt.userId.toString() !== req.user.userId) {
    throw new AppError('Unauthorized', 403);
  }

  if (testAttempt.status !== 'in-progress') {
    throw new AppError('Test is no longer in progress', 400);
  }

  const questionIndex = testAttempt.questions.findIndex(
    (q) => q.questionId.toString() === questionId
  );

  if (questionIndex === -1) {
    throw new AppError('Question not found in test', 404);
  }

  testAttempt.questions[questionIndex].selectedOption = selectedOption;
  testAttempt.questions[questionIndex].timeSpent = timeSpent || 0;
  testAttempt.questions[questionIndex].isMarkedForReview = isMarkedForReview || false;

  await testAttempt.save();

  sendResponse(res, 200, 'Answer saved successfully');
});

/**
 * Submit test and calculate score
 */
export const submitTest = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { reason } = req.body; // reason: 'time_up', 'manual', 'violation', etc.

  const testAttempt = await TestAttempt.findById(testId).populate({
    path: 'questions.questionId',
  });

  if (!testAttempt) {
    throw new AppError('Test not found', 404);
  }

  if (testAttempt.userId.toString() !== req.user.userId) {
    throw new AppError('Unauthorized', 403);
  }

  if (testAttempt.status !== 'in-progress') {
    throw new AppError('Test already submitted', 400);
  }

  // Handle violation-based zeroing
  if (reason === 'violation' || testAttempt.violations >= 2) {
    testAttempt.status = 'zeroed_due_to_violation';
    testAttempt.totalScore = 0;
    testAttempt.accuracy = 0;
    testAttempt.endTime = new Date();
    await testAttempt.save();

    return sendResponse(res, 200, 'Test submitted (zeroed due to violations)', {
      testId: testAttempt._id,
      totalScore: 0,
      status: 'zeroed_due_to_violation',
    });
  }

  // Calculate score
  let totalScore = 0;
  let correctAnswers = 0;

  testAttempt.questions.forEach((question) => {
    const questionDoc = question.questionId;
    if (question.selectedOption === questionDoc.correctOption) {
      totalScore += questionDoc.marks;
      question.isCorrect = true;
      correctAnswers++;
    } else if (question.selectedOption !== null) {
      totalScore -= questionDoc.negativeMarks;
    }
  });

  totalScore = Math.max(0, totalScore); // Ensure score doesn't go below 0

  const accuracy = ((correctAnswers / testAttempt.questions.length) * 100).toFixed(2);

  testAttempt.totalScore = totalScore;
  testAttempt.accuracy = accuracy;
  testAttempt.status = 'completed';
  testAttempt.endTime = new Date();

  await testAttempt.save();

  sendResponse(res, 200, 'Test submitted successfully', {
    testId: testAttempt._id,
    totalScore,
    maxScore: testAttempt.maxScore,
    accuracy,
    totalQuestions: testAttempt.questions.length,
    correctAnswers,
  });
});

/**
 * Record proctoring violation
 */
export const recordViolation = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { violationType } = req.body; // 'tab_switch', 'fullscreen_exit', 'back_navigation'

  const testAttempt = await TestAttempt.findById(testId);

  if (!testAttempt) {
    throw new AppError('Test not found', 404);
  }

  if (testAttempt.userId.toString() !== req.user.userId) {
    throw new AppError('Unauthorized', 403);
  }

  if (testAttempt.status !== 'in-progress') {
    return res.status(400).json({
      success: false,
      message: 'Test is no longer in progress',
    });
  }

  testAttempt.violations += 1;

  if (violationType === 'tab_switch') {
    testAttempt.tabSwitchViolations += 1;
  } else if (violationType === 'fullscreen_exit') {
    testAttempt.fullscreenExitViolations += 1;
  }

  // Auto-submit on second violation
  if (testAttempt.violations >= 2) {
    testAttempt.status = 'zeroed_due_to_violation';
    testAttempt.totalScore = 0;
    testAttempt.accuracy = 0;
    testAttempt.endTime = new Date();

    await testAttempt.save();

    return res.status(200).json({
      success: true,
      message: 'Second violation detected. Test auto-submitted with zero score.',
      autoSubmit: true,
      violations: testAttempt.violations,
    });
  }

  await testAttempt.save();

  res.status(200).json({
    success: true,
    message: `Violation recorded (${testAttempt.violations}/2)`,
    violations: testAttempt.violations,
    autoSubmit: false,
  });
});

/**
 * Get test results/analysis
 */
export const getTestResults = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const testAttempt = await TestAttempt.findById(testId).populate({
    path: 'questions.questionId',
  });

  if (!testAttempt) {
    throw new AppError('Test not found', 404);
  }

  if (testAttempt.userId.toString() !== req.user.userId) {
    throw new AppError('Unauthorized', 403);
  }

  const results = {
    testId: testAttempt._id,
    totalScore: testAttempt.totalScore,
    maxScore: testAttempt.maxScore,
    accuracy: testAttempt.accuracy,
    status: testAttempt.status,
    totalQuestions: testAttempt.questions.length,
    correctAnswers: testAttempt.questions.filter((q) => q.isCorrect).length,
    violations: testAttempt.violations,
    startTime: testAttempt.startTime,
    endTime: testAttempt.endTime,
    timeTaken: testAttempt.endTime
      ? Math.floor((testAttempt.endTime - testAttempt.startTime) / 1000)
      : null,
    questions: testAttempt.questions.map((q) => ({
      questionId: q.questionId._id,
      questionText: q.questionId.questionText,
      options: q.questionId.options,
      selectedOption: q.selectedOption,
      correctOption: q.questionId.correctOption,
      isCorrect: q.isCorrect,
      explanation: q.questionId.explanation,
      marks: q.questionId.marks,
      timeSpent: q.timeSpent,
    })),
  };

  sendResponse(res, 200, 'Test results retrieved', results);
});

/**
 * Get user's test history
 */
export const getUserTestHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const testAttempts = await TestAttempt.find({ userId: req.user.userId })
    .select('_id totalScore maxScore accuracy status violations startTime endTime createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await TestAttempt.countDocuments({ userId: req.user.userId });

  sendResponse(res, 200, 'Test history retrieved', {
    testAttempts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: parseInt(page),
    },
  });
});
