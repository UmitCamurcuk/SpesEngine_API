import express from 'express';
import { protect } from '../middleware/auth';
import {
  getItemTypes,
  getItemTypeById,
  createItemType,
  updateItemType,
  deleteItemType
} from '../controllers/itemTypeController';

const router = express.Router();

// GET tüm öğe tiplerini getir
router.get('/', protect, getItemTypes);

// GET tek bir öğe tipini getir
router.get('/:id', protect, getItemTypeById);

// POST yeni öğe tipi oluştur
router.post('/', protect, createItemType);

// PUT öğe tipini güncelle
router.put('/:id', protect, updateItemType);

// DELETE öğe tipini sil
router.delete('/:id', protect, deleteItemType);

export default router; 