import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Auth Endpoints
router.post('/login', authLimiter, AuthController.login);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.me);
router.post('/change-password', authenticateToken, AuthController.changePassword);

// Administrative User Management (SUPER_ADMIN only)
router.get('/users', authenticateToken, requireRole('SUPER_ADMIN'), AuthController.getUsers);
router.post('/users', authenticateToken, requireRole('SUPER_ADMIN'), AuthController.createUser);

export default router;
