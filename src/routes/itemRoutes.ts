import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  // Association endpoints
  getItemAssociations,
  createAssociation,
  removeAssociation,
  searchItemsForAssociation,
  getItemTypeAssociationRules,
  validateItemAssociations
} from '../controllers/itemController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['ITEMS_VIEW']), getItems)
  .post(checkAccess(['ITEMS_CREATE']), createItem);

router
  .route('/:id')
  .get(checkAccess(['ITEMS_VIEW']), getItemById)
  .put(checkAccess(['ITEMS_UPDATE']), updateItem)
  .delete(checkAccess(['ITEMS_DELETE']), deleteItem);

// ============================================================================
// ASSOCIATION ROUTES
// ============================================================================

// Item associations
router
  .route('/:id/associations')
  .get(checkAccess(['ITEMS_VIEW']), getItemAssociations);

// Association management
router
  .route('/:sourceItemId/associations/create')
  .post(checkAccess(['ITEMS_UPDATE']), createAssociation);

router
  .route('/:sourceItemId/associations/remove')
  .post(checkAccess(['ITEMS_UPDATE']), removeAssociation);

// Search items for association
router
  .route('/:sourceItemId/search/:targetItemTypeCode')
  .get(checkAccess(['ITEMS_VIEW']), searchItemsForAssociation);

// ItemType association rules
router
  .route('/types/:itemTypeCode/association-rules')
  .get(checkAccess(['ITEMS_VIEW']), getItemTypeAssociationRules);

// Association validation
router
  .route('/:id/associations/validate')
  .post(checkAccess(['ITEMS_VIEW']), validateItemAssociations);

export default router; 