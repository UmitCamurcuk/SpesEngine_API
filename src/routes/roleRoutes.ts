import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  addPermissionGroupToRole,
  removePermissionGroupFromRole
} from '../controllers/roleController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['ROLES_VIEW']), getRoles)
  .post(checkAccess(['ROLES_CREATE']), createRole);

router
  .route('/:id')
  .get(checkAccess(['ROLES_VIEW']), getRoleById)
  .put(checkAccess(['ROLES_UPDATE']), updateRole)
  .delete(checkAccess(['ROLES_DELETE']), deleteRole);

// Role'e permission group ekleme/çıkarma
router
  .route('/:id/permissionGroups')
  .post(checkAccess(['ROLES_UPDATE']), addPermissionGroupToRole);

router
  .route('/:id/permissionGroups/:permissionGroupId')
  .delete(checkAccess(['ROLES_UPDATE']), removePermissionGroupFromRole);

export default router; 