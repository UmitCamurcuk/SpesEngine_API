import express from 'express';
import { protect } from '../middleware/auth';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController';

const router = express.Router();

// GET tüm öğeleri getir - koruma kaldırıldı (geliştirme aşamasında)
router.get('/', getItems);

// GET belirli bir öğeyi getir - koruma kaldırıldı (geliştirme aşamasında)
router.get('/:id', getItemById);

// POST yeni öğe oluştur - koruma kaldırıldı (geliştirme aşamasında)
router.post('/', createItem);

// PUT öğeyi güncelle - koruma kaldırıldı (geliştirme aşamasında)
router.put('/:id', updateItem);

// DELETE öğeyi sil - koruma kaldırıldı (geliştirme aşamasında)
router.delete('/:id', deleteItem);

export default router; 