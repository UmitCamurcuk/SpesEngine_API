import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  getFamiliesByCategory
} from '../controllers/familyController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['FAMILIES_VIEW']), getFamilies)
  .post(checkAccess(['FAMILIES_CREATE']), createFamily);

// Kategoriye göre aileleri getir
router
  .route('/by-category/:categoryId')
  .get(checkAccess(['FAMILIES_VIEW']), getFamiliesByCategory);

router
  .route('/:id')
  .get(checkAccess(['FAMILIES_VIEW']), getFamilyById)
  .put(checkAccess(['FAMILIES_UPDATE']), updateFamily)
  .delete(checkAccess(['FAMILIES_DELETE']), deleteFamily);

export default router; 