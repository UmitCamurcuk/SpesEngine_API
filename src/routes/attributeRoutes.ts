import express from 'express';
import { protect, authorize, checkPermission } from '../middleware/auth';
import {
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute
} from '../controllers/attributeController';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('attributes:read'), getAttributes)
  .post(checkPermission('attributes:create'), createAttribute);

router
  .route('/:id')
  .get(checkPermission('attributes:read'), getAttributeById)
  .put(checkPermission('attributes:update'), updateAttribute)
  .delete(checkPermission('attributes:delete'), deleteAttribute);

export default router; 