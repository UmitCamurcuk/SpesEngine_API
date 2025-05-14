import express from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize, checkPermission } from '../middleware/auth';

const router = express.Router();

// Koruma middleware'i uygula
router.use(protect);

// Rota tanımlamaları
router
  .route('/')
  .get(authorize('admin'), checkPermission('users:read'), getUsers)
  .post(authorize('admin'), checkPermission('users:create'), createUser);

router
  .route('/:id')
  .get(authorize('admin'), checkPermission('users:read'), getUser)
  .put(authorize('admin'), checkPermission('users:update'), updateUser)
  .delete(authorize('admin'), checkPermission('users:delete'), deleteUser);

export default router;