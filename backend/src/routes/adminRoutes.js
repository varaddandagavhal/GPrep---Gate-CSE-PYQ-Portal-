import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

/**
 * User Management Routes
 */
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-block', adminController.toggleBlockUser);
router.delete('/users/:id', adminController.deleteUser);

/**
 * Analytics Routes
 */
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getPlatformAnalytics);

export default router;
