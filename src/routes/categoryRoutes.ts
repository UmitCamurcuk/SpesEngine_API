import express from 'express';
import { protect } from '../middleware/auth';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

// GET tüm kategorileri getir (filtreleme ve sayfalama ile)
router.get('/', protect, getCategories);

// GET tek bir kategoriyi getir
router.get('/:id', protect, getCategoryById);

// POST yeni kategori oluştur
router.post('/', protect, createCategory);

// PUT kategoriyi güncelle
router.put('/:id', protect, updateCategory);

// DELETE kategoriyi sil
router.delete('/:id', protect, deleteCategory);

export default router; 