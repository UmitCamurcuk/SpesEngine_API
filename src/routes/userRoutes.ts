import express from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// Kullanıcı işlemleri
router.route('/')
  .get(checkAccess(['USERS_VIEW']), getUsers)
  .post(checkAccess(['USERS_CREATE']), createUser);

router.route('/:id')
  .get(checkAccess(['USERS_VIEW']), getUser)
  .put(checkAccess(['USERS_UPDATE']), updateUser)
  .delete(checkAccess(['USERS_DELETE']), deleteUser);

export default router;