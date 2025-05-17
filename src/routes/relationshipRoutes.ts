import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import * as relationshipController from '../controllers/relationshipController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// İlişki rotaları
router.post('/', checkAccess(['RELATIONSHIPS_CREATE']), relationshipController.createRelationship);
router.get('/:id', checkAccess(['RELATIONSHIPS_VIEW']), relationshipController.getRelationshipById);
router.put('/:id', checkAccess(['RELATIONSHIPS_UPDATE']), relationshipController.updateRelationship);
router.delete('/:id', checkAccess(['RELATIONSHIPS_DELETE']), relationshipController.deleteRelationship);
router.patch('/:id/status', checkAccess(['RELATIONSHIPS_UPDATE']), relationshipController.changeRelationshipStatus);

// Varlık bazlı ilişki rotaları
router.get('/entities/:entityType/:entityId', checkAccess(['RELATIONSHIPS_VIEW']), relationshipController.getRelationshipsByEntity);

// İlişki tipi bazlı ilişki rotaları
router.get('/by-type/:typeId', checkAccess(['RELATIONSHIPS_VIEW']), relationshipController.getRelationshipsByType);

export default router; 