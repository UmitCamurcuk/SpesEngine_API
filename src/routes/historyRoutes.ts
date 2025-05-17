import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import { getEntityHistory, getHistory } from '../controllers/historyController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// Geçmiş kayıtları
router.get('/', checkAccess(['HISTORY_VIEW']), getHistory);
router.get('/:entityType/:entityId', checkAccess(['HISTORY_VIEW']), getEntityHistory);

export default router; 