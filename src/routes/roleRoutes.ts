import express from 'express';
import {
  getRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole
} from '../controllers/roleController';
import { protect, authorize, checkPermission } from '../middleware/auth';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('roles:read'), getRoles)
  .post(authorize('admin'), checkPermission('roles:create'), createRole);

router
  .route('/:id')
  .get(checkPermission('roles:read'), getRoleById)
  .put(authorize('admin'), checkPermission('roles:update'), updateRole)
  .delete(authorize('admin'), checkPermission('roles:delete'), deleteRole);

export default router; 