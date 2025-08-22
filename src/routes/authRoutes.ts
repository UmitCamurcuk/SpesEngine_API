import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  register,
  login,
  getMe,
  logout,
  refreshPermissions,
  refreshToken,
  updateProfile,
  uploadAvatar
} from '../controllers/authController';

const router = express.Router();

// Açık rotalar
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Korumalı rotalar
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.get('/refresh-permissions', authenticateToken, refreshPermissions);
router.put('/profile', authenticateToken, updateProfile);
router.post('/avatar', authenticateToken, uploadAvatar);

export default router; 