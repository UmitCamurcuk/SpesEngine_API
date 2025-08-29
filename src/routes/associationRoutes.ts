import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  createAssociation,
  getAllAssociations,
  getAssociationById,
  updateAssociation,
  deleteAssociation,
  getFilteredTargetItems,
  getAssociationFilterInfo,
  getAvailableAssociationsForItem
} from '../controllers/associationController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// Association CRUD rotaları
router.post('/', checkAccess(['ASSOCIATIONS_CREATE']), createAssociation);
router.get('/', checkAccess(['ASSOCIATIONS_VIEW']), getAllAssociations);
router.get('/:id', checkAccess(['ASSOCIATIONS_VIEW']), getAssociationById);
router.put('/:id', checkAccess(['ASSOCIATIONS_UPDATE']), updateAssociation);
router.delete('/:id', checkAccess(['ASSOCIATIONS_DELETE']), deleteAssociation);

// Filter-based rotalar
router.get('/:associationId/filtered-items/:sourceItemId', 
  checkAccess(['ASSOCIATIONS_VIEW']), 
  getFilteredTargetItems
);

router.get('/:associationId/filter-info', 
  checkAccess(['ASSOCIATIONS_VIEW']), 
  getAssociationFilterInfo
);

router.get('/available-for-item/:itemId', 
  checkAccess(['ASSOCIATIONS_VIEW']), 
  getAvailableAssociationsForItem
);

export default router; 