import express from 'express';
import { getEntityHistory, getHistory } from '../controllers/historyController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Tüm route'lar korumalı olmalı
router.use(protect);

// Tüm geçmiş kayıtlarını getir
router.get('/', getHistory);

// Belirli bir varlığın geçmiş kayıtlarını getir
router.get('/:entityId', getEntityHistory);

export default router; 