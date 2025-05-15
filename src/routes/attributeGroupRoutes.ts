import express from 'express';
import { protect, authorize, checkPermission } from '../middleware/auth';
import {
  getAttributeGroups,
  getAttributeGroupById,
  createAttributeGroup,
  updateAttributeGroup,
  deleteAttributeGroup
} from '../controllers/attributeGroupController';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('attributeGroups:read'), getAttributeGroups)
  .post(checkPermission('attributeGroups:create'), createAttributeGroup);

router
  .route('/:id')
  .get(checkPermission('attributeGroups:read'), getAttributeGroupById)
  .put(checkPermission('attributeGroups:update'), updateAttributeGroup)
  .delete(checkPermission('attributeGroups:delete'), deleteAttributeGroup);

export default router; 