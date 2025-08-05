import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import * as associationController from '../controllers/associationController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// Association rotaları
router.post('/', checkAccess(['ASSOCIATIONS_CREATE']), associationController.createAssociation);
router.get('/', checkAccess(['ASSOCIATIONS_VIEW']), associationController.getAllAssociations);
router.get('/:id', checkAccess(['ASSOCIATIONS_VIEW']), associationController.getAssociationById);
router.put('/:id', checkAccess(['ASSOCIATIONS_UPDATE']), associationController.updateAssociation);
router.delete('/:id', checkAccess(['ASSOCIATIONS_DELETE']), associationController.deleteAssociation);

export default router; 