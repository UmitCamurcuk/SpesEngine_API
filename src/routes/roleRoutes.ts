import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole
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

export default router; 