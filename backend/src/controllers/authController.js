import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler, sendResponse, AppError } from '../utils/errors.js';

/**
 * User Registration Controller
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
  });

  const token = generateToken(user._id, user.email, user.role);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, 201, 'User registered successfully', {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    token,
  });
});

/**
 * User Login Controller
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.isBlocked) {
    throw new AppError('Your account has been blocked', 403);
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user._id, user.email, user.role);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, 200, 'Login successful', {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    token,
  });
});

/**
 * Logout Controller
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  sendResponse(res, 200, 'Logged out successfully');
});

/**
 * Get Current User
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendResponse(res, 200, 'User retrieved', {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    isBlocked: user.isBlocked,
  });
});

/**
 * Update Profile (name)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    throw new AppError('Name must be at least 2 characters', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { name: name.trim() },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendResponse(res, 200, 'Profile updated', {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

/**
 * Change Password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user.userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendResponse(res, 200, 'Password changed successfully');
});
