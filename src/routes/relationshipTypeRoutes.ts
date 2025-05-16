import express from 'express';
import * as relationshipTypeController from '../controllers/relationshipTypeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// İlişki Tipi rotaları
router.post('/', protect, relationshipTypeController.createRelationshipType);
router.get('/', relationshipTypeController.getAllRelationshipTypes);
router.get('/:id', relationshipTypeController.getRelationshipTypeById);
router.put('/:id', protect, relationshipTypeController.updateRelationshipType);
router.delete('/:id', protect, relationshipTypeController.deleteRelationshipType);

export default router; 