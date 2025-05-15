import express from 'express';
import { protect, authorize, checkPermission } from '../middleware/auth';
import {
  getItemTypes,
  getItemTypeById,
  createItemType,
  updateItemType,
  deleteItemType
} from '../controllers/itemTypeController';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('itemTypes:read'), getItemTypes)
  .post(checkPermission('itemTypes:create'), createItemType);

router
  .route('/:id')
  .get(checkPermission('itemTypes:read'), getItemTypeById)
  .put(checkPermission('itemTypes:update'), updateItemType)
  .delete(checkPermission('itemTypes:delete'), deleteItemType);

export default router; 