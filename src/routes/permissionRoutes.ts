import express from 'express';
import {
  getPermissions,
  createPermission,
  getPermissionById,
  updatePermission,
  deletePermission
} from '../controllers/permissionController';
import { protect, authorize, checkPermission } from '../middleware/auth';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('permissions:read'), getPermissions)
  .post(authorize('admin'), checkPermission('permissions:create'), createPermission);

router
  .route('/:id')
  .get(checkPermission('permissions:read'), getPermissionById)
  .put(authorize('admin'), checkPermission('permissions:update'), updatePermission)
  .delete(authorize('admin'), checkPermission('permissions:delete'), deletePermission);

export default router; 