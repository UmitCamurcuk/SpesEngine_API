import express from 'express';
import { protect } from '../middleware/auth';
import {
  getAttributeGroups,
  getAttributeGroupById,
  createAttributeGroup,
  updateAttributeGroup,
  deleteAttributeGroup
} from '../controllers/attributeGroupController';

const router = express.Router();

// GET tüm öznitelik gruplarını getir
router.get('/', protect, getAttributeGroups);

// GET tek bir öznitelik grubunu getir
router.get('/:id', protect, getAttributeGroupById);

// POST yeni öznitelik grubu oluştur
router.post('/', protect, createAttributeGroup);

// PUT öznitelik grubunu güncelle
router.put('/:id', protect, updateAttributeGroup);

// DELETE öznitelik grubunu sil
router.delete('/:id', protect, deleteAttributeGroup);

export default router; 