import express from 'express';
import { protect, authorize, checkPermission } from '../middleware/auth';
import {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily
} from '../controllers/familyController';

const router = express.Router();

// Tüm routelar korumalı
router.use(protect);

router
  .route('/')
  .get(checkPermission('families:read'), getFamilies)
  .post(checkPermission('families:create'), createFamily);

router
  .route('/:id')
  .get(checkPermission('families:read'), getFamilyById)
  .put(checkPermission('families:update'), updateFamily)
  .delete(checkPermission('families:delete'), deleteFamily);

export default router; 