import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getAttributeGroups,
  getAttributeGroupById,
  createAttributeGroup,
  updateAttributeGroup,
  deleteAttributeGroup
} from '../controllers/attributeGroupController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['ATTRIBUTE_GROUPS_VIEW']), getAttributeGroups)
  .post(checkAccess(['ATTRIBUTE_GROUPS_CREATE']), createAttributeGroup);

router
  .route('/:id')
  .get(checkAccess(['ATTRIBUTE_GROUPS_VIEW']), getAttributeGroupById)
  .put(checkAccess(['ATTRIBUTE_GROUPS_UPDATE']), updateAttributeGroup)
  .delete(checkAccess(['ATTRIBUTE_GROUPS_DELETE']), deleteAttributeGroup);

export default router; 