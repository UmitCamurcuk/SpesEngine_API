import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getPermissionGroups,
  createPermissionGroup,
  getPermissionGroupById,
  updatePermissionGroup,
  deletePermissionGroup
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

export default router; 