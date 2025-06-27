import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByItemType
} from '../controllers/categoryController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['CATEGORIES_VIEW']), getCategories)
  .post(checkAccess(['CATEGORIES_CREATE']), createCategory);

// ItemType'a göre kategorileri getir
router
  .route('/by-itemtype/:itemTypeId')
  .get(checkAccess(['CATEGORIES_VIEW']), getCategoriesByItemType);

router
  .route('/:id')
  .get(checkAccess(['CATEGORIES_VIEW']), getCategoryById)
  .put(checkAccess(['CATEGORIES_UPDATE']), updateCategory)
  .delete(checkAccess(['CATEGORIES_DELETE']), deleteCategory);

export default router; 