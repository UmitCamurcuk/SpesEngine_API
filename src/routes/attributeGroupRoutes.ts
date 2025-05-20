import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import {
  getAttributeGroups,
  getAttributeGroupById,
  createAttributeGroup,
  updateAttributeGroup,
  deleteAttributeGroup
} from '../controllers/attributeGroupController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// Test endpoint - attributeGroup içindeki öznitelikleri kontrol etmek için
router.get('/test/:id', async (req, res) => {
  try {
    const AttributeGroup = await import('../models/AttributeGroup');
    const group = await AttributeGroup.default.findById(req.params.id).populate('attributes');
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Grup bulunamadı' });
    }
    
    res.status(200).json({
      success: true,
      data: {
        _id: group._id,
        name: group.name,
        attributesLength: group.attributes ? group.attributes.length : 0,
        attributes: group.attributes
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'AttributeGroup kontrolü sırasında hata oluştu'
    });
  }
});

router
  .route('/')
  .get(checkAccess(['ATTRIBUTE_GROUPS_VIEW']), getAttributeGroups)
  .post(checkAccess(['ATTRIBUTE_GROUPS_CREATE']), createAttributeGroup);

router
  .route('/:id')
  .get(checkAccess(['ATTRIBUTE_GROUPS_VIEW']), getAttributeGroupById)
  .put(checkAccess(['ATTRIBUTE_GROUPS_UPDATE']), updateAttributeGroup)
  .delete(checkAccess(['ATTRIBUTE_GROUPS_DELETE']), deleteAttributeGroup);

export default router; 