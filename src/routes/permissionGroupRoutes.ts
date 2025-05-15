import express from 'express';
import {
  getPermissionGroups,
  createPermissionGroup,
  getPermissionGroupById,
  updatePermissionGroup,
  deletePermissionGroup
} from '../controllers/permissionGroupController';
import { protect, authorize, checkPermission } from '../middleware/auth';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('permissions:read'), getPermissionGroups)
  .post(authorize('admin'), checkPermission('permissions:create'), createPermissionGroup);

router
  .route('/:id')
  .get(checkPermission('permissions:read'), getPermissionGroupById)
  .put(authorize('admin'), checkPermission('permissions:update'), updatePermissionGroup)
  .delete(authorize('admin'), checkPermission('permissions:delete'), deletePermissionGroup);

export default router; 