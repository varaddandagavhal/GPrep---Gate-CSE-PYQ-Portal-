import { verifyToken } from '../utils/jwt.js';
import { AppError, asyncHandler } from '../utils/errors.js';

/**
 * Authentication Middleware
 * Verifies JWT token from cookies or Authorization header
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError('Authentication token not found', 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
});

/**
 * Authorization Middleware for Admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

/**
 * Authorization Middleware for Student
 */
export const isStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.',
    });
  }
  next();
};

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
