import express from 'express';
import { getEntityHistory, getHistory } from '../controllers/historyController';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

// Tüm route'lar korumalı olmalı
router.use(protect);

// Tüm geçmiş kayıtlarını getir - history:read izni gerekli
router.get('/', checkPermission('history:read'), getHistory);

// Belirli bir varlığın geçmiş kayıtlarını getir - history:read izni gerekli
router.get('/:entityId', checkPermission('history:read'), getEntityHistory);

export default router; 