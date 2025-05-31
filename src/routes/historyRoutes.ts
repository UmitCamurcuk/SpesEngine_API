import express from 'express';
import * as historyController from '../controllers/historyController';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// GET /api/history - Tüm history kayıtlarını getir
router.get('/', checkAccess(['HISTORY_VIEW']), historyController.getHistory);

// GET /api/history/:entityId - Belirli entity'nin history kayıtlarını getir
router.get('/:entityId', checkAccess(['HISTORY_VIEW']), historyController.getEntityHistory);

export default router; 