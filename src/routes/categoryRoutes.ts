import express from 'express';
import { protect, authorize, checkPermission } from '../middleware/auth';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('categories:read'), getCategories)
  .post(checkPermission('categories:create'), createCategory);

router
  .route('/:id')
  .get(checkPermission('categories:read'), getCategoryById)
  .put(checkPermission('categories:update'), updateCategory)
  .delete(checkPermission('categories:delete'), deleteCategory);

export default router; 