import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getItemTypes,
  getItemTypeById,
  createItemType,
  updateItemType,
  deleteItemType
} from '../controllers/itemTypeController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['ITEM_TYPES_VIEW']), getItemTypes)
  .post(checkAccess(['ITEM_TYPES_CREATE']), createItemType);

router
  .route('/:id')
  .get(checkAccess(['ITEM_TYPES_VIEW']), getItemTypeById)
  .put(checkAccess(['ITEM_TYPES_UPDATE']), updateItemType)
  .delete(checkAccess(['ITEM_TYPES_DELETE']), deleteItemType);

export default router; 