import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  register,
  login,
  getMe,
  logout,
  refreshPermissions
} from '../controllers/authController';

const router = express.Router();

// Açık rotalar
router.post('/register', register);
router.post('/login', login);

// Korumalı rotalar
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.get('/refresh-permissions', authenticateToken, refreshPermissions);

export default router; 