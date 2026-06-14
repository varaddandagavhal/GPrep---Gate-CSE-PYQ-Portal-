import User from '../models/User.js';
import TestAttempt from '../models/TestAttempt.js';
import Question from '../models/Question.js';
import { asyncHandler, sendResponse, AppError } from '../utils/errors.js';

/**
 * Get all users (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, isBlocked } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

  const skip = (page - 1) * limit;
  const users = await User.find(filter)
    .select('-password')
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  sendResponse(res, 200, 'Users retrieved', {
    users,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: parseInt(page),
    },
  });
});

/**
 * Block/Unblock user (Admin only)
 */
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  sendResponse(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, {
    userId: user._id,
    isBlocked: user.isBlocked,
  });
});

/**
 * Delete user (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Also delete user's test attempts
  await TestAttempt.deleteMany({ userId: req.params.id });

  sendResponse(res, 200, 'User deleted successfully');
});

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const totalQuestions = await Question.countDocuments();
  const totalTestAttempts = await TestAttempt.countDocuments();

  const recentAttempts = await TestAttempt.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email')
    .lean();

  const stats = {
    totalUsers,
    totalStudents,
    totalAdmins,
    totalQuestions,
    totalTestAttempts,
    recentAttempts,
  };

  sendResponse(res, 200, 'Dashboard stats retrieved', stats);
});

/**
 * Get platform analytics
 */
export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const completedAttempts = await TestAttempt.find({ status: 'completed' });

  let totalScore = 0;
  let totalAccuracy = 0;
  let violationCount = 0;
  let abortedCount = 0;

  completedAttempts.forEach((attempt) => {
    totalScore += attempt.totalScore;
    totalAccuracy += attempt.accuracy || 0;
    violationCount += attempt.violations;
  });

  abortedCount = await TestAttempt.countDocuments({
    status: { $in: ['aborted', 'zeroed_due_to_violation'] },
  });

  const analytics = {
    averageScore:
      completedAttempts.length > 0 ? (totalScore / completedAttempts.length).toFixed(2) : 0,
    averageAccuracy:
      completedAttempts.length > 0 ? (totalAccuracy / completedAttempts.length).toFixed(2) : 0,
    totalViolations: violationCount,
    abortedCount,
    completedTestCount: completedAttempts.length,
  };

  sendResponse(res, 200, 'Analytics retrieved', analytics);
});
