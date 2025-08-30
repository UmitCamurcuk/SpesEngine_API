import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getItems,
  getItemById,
  getItemsByType,
  createItem,
  updateItem,
  deleteItem,
  // Association endpoints
  getItemAssociations,
  createAssociation,
  removeAssociation,
  searchItemsForAssociation,
  getItemTypeAssociationRules,
  validateItemAssociations,
  // Enhanced association endpoints
  getItemAssociationRules,
  getFilteredItemsByRule,
  getItemAssociationMetadata,
  createRuleBasedAssociation
} from '../controllers/itemController';

const router = express.Router();

// Tüm rotalar için token kontrolü - Geçici olarak kaldırıldı
// router.use(authenticateToken);

router
  .route('/')
  .get(checkAccess(['ITEMS_VIEW']), getItems)
  .post(checkAccess(['ITEMS_CREATE']), createItem);

router
  .route('/:id')
  .get(getItemById) // Geçici olarak authentication kaldırıldı
  .put(checkAccess(['ITEMS_UPDATE']), updateItem)
  .delete(checkAccess(['ITEMS_DELETE']), deleteItem);

// Get items by ItemType
router
  .route('/types/:itemTypeCode')
  .get(checkAccess(['ITEMS_VIEW']), getItemsByType);

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

// ============================================================================
// ENHANCED ASSOCIATION ROUTES (Rule-based)
// ============================================================================

// Get item's association rules
router
  .route('/:id/association-rules')
  .get(checkAccess(['ITEMS_VIEW']), getItemAssociationRules);

// Get filtered items by rule
router
  .route('/:id/rule/:ruleCode/filtered-items')
  .get(checkAccess(['ITEMS_VIEW']), getFilteredItemsByRule);

// Get association metadata for rule
router
  .route('/:id/rule/:ruleCode/metadata')
  .get(checkAccess(['ITEMS_VIEW']), getItemAssociationMetadata);

// Create rule-based association
router
  .route('/:id/rule/:ruleCode/associate')
  .post(checkAccess(['ITEMS_UPDATE']), createRuleBasedAssociation);

export default router; 