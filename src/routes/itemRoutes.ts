import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['ITEMS_VIEW']), getItems)
  .post(checkAccess(['ITEMS_CREATE']), createItem);

router
  .route('/:id')
  .get(checkAccess(['ITEMS_VIEW']), getItemById)
  .put(checkAccess(['ITEMS_UPDATE']), updateItem)
  .delete(checkAccess(['ITEMS_DELETE']), deleteItem);

export default router; 