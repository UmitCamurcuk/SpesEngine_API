import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import * as relationshipTypeController from '../controllers/relationshipTypeController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// İlişki Tipi rotaları
router.post('/', checkAccess(['RELATIONSHIP_TYPES_CREATE']), relationshipTypeController.createRelationshipType);
router.get('/', checkAccess(['RELATIONSHIP_TYPES_VIEW']), relationshipTypeController.getAllRelationshipTypes);
router.get('/:id', checkAccess(['RELATIONSHIP_TYPES_VIEW']), relationshipTypeController.getRelationshipTypeById);
router.put('/:id', checkAccess(['RELATIONSHIP_TYPES_UPDATE']), relationshipTypeController.updateRelationshipType);
router.delete('/:id', checkAccess(['RELATIONSHIP_TYPES_DELETE']), relationshipTypeController.deleteRelationshipType);

export default router; 