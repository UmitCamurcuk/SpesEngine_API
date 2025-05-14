import express from 'express';
import { protect } from '../middleware/auth';
import {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily
} from '../controllers/familyController';

const router = express.Router();

// GET tüm aileleri getir
router.get('/', protect, getFamilies);

// GET tek bir aileyi getir
router.get('/:id', protect, getFamilyById);

// POST yeni aile oluştur
router.post('/', protect, createFamily);

// PUT aileyi güncelle
router.put('/:id', protect, updateFamily);

// DELETE aileyi sil
router.delete('/:id', protect, deleteFamily);

export default router; 