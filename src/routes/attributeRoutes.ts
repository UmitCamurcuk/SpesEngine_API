import express from 'express';
import { protect } from '../middleware/auth';
import {
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute
} from '../controllers/attributeController';

const router = express.Router();

// GET tüm öznitelikleri getir
router.get('/', protect, getAttributes);

// GET tek bir özniteliği getir
router.get('/:id', protect, getAttributeById);

// POST yeni öznitelik oluştur
router.post('/', protect, createAttribute);

// PUT özniteliği güncelle
router.put('/:id', protect, updateAttribute);

// DELETE özniteliği sil
router.delete('/:id', protect, deleteAttribute);

export default router; 