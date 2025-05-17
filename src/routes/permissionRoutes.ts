import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getPermissions,
  createPermission,
  getPermissionById,
  updatePermission,
  deletePermission
} from '../controllers/permissionController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['PERMISSIONS_VIEW']), getPermissions)
  .post(checkAccess(['PERMISSIONS_CREATE']), createPermission);

router
  .route('/:id')
  .get(checkAccess(['PERMISSIONS_VIEW']), getPermissionById)
  .put(checkAccess(['PERMISSIONS_UPDATE']), updatePermission)
  .delete(checkAccess(['PERMISSIONS_DELETE']), deletePermission);

export default router; 