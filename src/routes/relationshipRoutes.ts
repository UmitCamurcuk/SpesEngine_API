import express from 'express';
import * as relationshipController from '../controllers/relationshipController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// İlişki rotaları
router.post('/', protect, relationshipController.createRelationship);
router.get('/:id', relationshipController.getRelationshipById);
router.put('/:id', protect, relationshipController.updateRelationship);
router.delete('/:id', protect, relationshipController.deleteRelationship);
router.patch('/:id/status', protect, relationshipController.changeRelationshipStatus);

// Varlık bazlı ilişki rotaları
router.get('/entities/:entityType/:entityId', relationshipController.getRelationshipsByEntity);

// İlişki tipi bazlı ilişki rotaları
router.get('/by-type/:typeId', relationshipController.getRelationshipsByType);

export default router; 