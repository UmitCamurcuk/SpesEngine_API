import express from 'express';
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser,
  getUsersByRole,
  getUsersNotInRole,
  assignRoleToUser,
  removeRoleFromUser
} from '../controllers/userController';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// Kullanıcı işlemleri
router.route('/')
  .get(checkAccess(['USERS_VIEW']), getUsers)
  .post(checkAccess(['USERS_CREATE']), createUser);

// Role bazlı kullanıcı sorguları
router.route('/by-role/:roleId')
  .get(checkAccess(['USERS_VIEW']), getUsersByRole);

router.route('/not-in-role/:roleId')
  .get(checkAccess(['USERS_VIEW']), getUsersNotInRole);

// Kullanıcı rol yönetimi
router.route('/:userId/assign-role')
  .post(checkAccess(['ROLES_UPDATEUSERS']), assignRoleToUser);

router.route('/:userId/remove-role/:roleId')
  .delete(checkAccess(['ROLES_UPDATEUSERS']), removeRoleFromUser);

router.route('/:id')
  .get(checkAccess(['USERS_VIEW']), getUser)
  .put(checkAccess(['USERS_UPDATE']), updateUser)
  .delete(checkAccess(['USERS_DELETE']), deleteUser);

export default router;