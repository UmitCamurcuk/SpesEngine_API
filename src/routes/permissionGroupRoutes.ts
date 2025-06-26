import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getPermissionGroups,
  createPermissionGroup,
  getPermissionGroupById,
  updatePermissionGroup,
  deletePermissionGroup,
  addPermissionToGroup,
  removePermissionFromGroup
} from '../controllers/permissionGroupController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['PERMISSION_GROUPS_VIEW']), getPermissionGroups)
  .post(checkAccess(['PERMISSION_GROUPS_CREATE']), createPermissionGroup);

router
  .route('/:id')
  .get(checkAccess(['PERMISSION_GROUPS_VIEW']), getPermissionGroupById)
  .put(checkAccess(['PERMISSION_GROUPS_UPDATE']), updatePermissionGroup)
  .delete(checkAccess(['PERMISSION_GROUPS_DELETE']), deletePermissionGroup);

// Permission group'a permission ekleme/çıkarma
router
  .route('/:id/permissions')
  .post(checkAccess(['PERMISSION_GROUPS_UPDATE']), addPermissionToGroup);

router
  .route('/:id/permissions/:permissionId')
  .delete(checkAccess(['PERMISSION_GROUPS_UPDATE']), removePermissionFromGroup);

export default router; 