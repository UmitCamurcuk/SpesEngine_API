import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getAttributes,
  getAttributeById,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getAttributeGroups,
  updateAttributeGroups
} from '../controllers/attributeController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['ATTRIBUTES_VIEW']), getAttributes)
  .post(checkAccess(['ATTRIBUTES_CREATE']), createAttribute);

router
  .route('/:id')
  .get(checkAccess(['ATTRIBUTES_VIEW']), getAttributeById)
  .put(checkAccess(['ATTRIBUTES_UPDATE']), updateAttribute)
  .delete(checkAccess(['ATTRIBUTES_DELETE']), deleteAttribute);

// Attribute Groups ilişkileri
router
  .route('/:id/groups')
  .get(checkAccess(['ATTRIBUTES_VIEW']), getAttributeGroups)
  .put(checkAccess(['ATTRIBUTES_UPDATE']), updateAttributeGroups);

export default router; 