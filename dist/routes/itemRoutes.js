"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const itemController_1 = require("../controllers/itemController");
const router = express_1.default.Router();
// Tüm rotalar için token kontrolü - Geçici olarak kaldırıldı
// router.use(authenticateToken);
router
    .route('/')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItems)
    .post((0, auth_middleware_1.checkAccess)(['ITEMS_CREATE']), itemController_1.createItem);
router
    .route('/:id')
    .get(itemController_1.getItemById) // Geçici olarak authentication kaldırıldı
    .put((0, auth_middleware_1.checkAccess)(['ITEMS_UPDATE']), itemController_1.updateItem)
    .delete((0, auth_middleware_1.checkAccess)(['ITEMS_DELETE']), itemController_1.deleteItem);
// Get items by ItemType
router
    .route('/types/:itemTypeCode')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItemsByType);
// ============================================================================
// ASSOCIATION ROUTES
// ============================================================================
// Item associations
router
    .route('/:id/associations')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItemAssociations);
// Association management
router
    .route('/:sourceItemId/associations/create')
    .post((0, auth_middleware_1.checkAccess)(['ITEMS_UPDATE']), itemController_1.createAssociation);
router
    .route('/:sourceItemId/associations/remove')
    .post((0, auth_middleware_1.checkAccess)(['ITEMS_UPDATE']), itemController_1.removeAssociation);
// Search items for association
router
    .route('/:sourceItemId/search/:targetItemTypeCode')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.searchItemsForAssociation);
// ItemType association rules
router
    .route('/types/:itemTypeCode/association-rules')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItemTypeAssociationRules);
// Association validation
router
    .route('/:id/associations/validate')
    .post((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.validateItemAssociations);
// ============================================================================
// ENHANCED ASSOCIATION ROUTES (Rule-based)
// ============================================================================
// Get item's association rules
router
    .route('/:id/association-rules')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItemAssociationRules);
// Get filtered items by rule
router
    .route('/:id/rule/:ruleCode/filtered-items')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getFilteredItemsByRule);
// Get association metadata for rule
router
    .route('/:id/rule/:ruleCode/metadata')
    .get((0, auth_middleware_1.checkAccess)(['ITEMS_VIEW']), itemController_1.getItemAssociationMetadata);
// Create rule-based association
router
    .route('/:id/rule/:ruleCode/associate')
    .post((0, auth_middleware_1.checkAccess)(['ITEMS_UPDATE']), itemController_1.createRuleBasedAssociation);
exports.default = router;
