import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController';

const router = express.Router();

// Not: Geliştirme aşamasında olduğu için koruma mekanizmaları geçici olarak kaldırıldı
// Üretim aşamasında router.use(protect) ve ilgili izin kontrolleri eklenmelidir

router
  .route('/')
  .get(getItems)
  .post(createItem);

router
  .route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

export default router; 