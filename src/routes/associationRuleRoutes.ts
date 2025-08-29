import express from 'express';
import {
  createAssociationRule,
  getAssociationRules,
  getAssociationRule,
  updateAssociationRule,
  deleteAssociationRule,
  getFilteredItems,
  getAssociationMetadata,
  createAssociationWithRule,
  getItemTypeAssociationRules
} from '../controllers/associationRuleController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Auth middleware'i tüm route'lara uygula
router.use(authMiddleware);

/**
 * Association Rule CRUD Operations
 */

// Association kuralı oluştur
router.post('/',
  [
    body('code')
      .notEmpty()
      .withMessage('Kural kodu gerekli')
      .isLength({ min: 2, max: 50 })
      .withMessage('Kural kodu 2-50 karakter arası olmalı'),
    body('name')
      .notEmpty()
      .withMessage('Kural adı gerekli'),
    body('associationId')
      .notEmpty()
      .withMessage('Association ID gerekli')
      .isMongoId()
      .withMessage('Geçerli association ID gerekli'),
    body('sourceItemTypeCode')
      .notEmpty()
      .withMessage('Kaynak ItemType kodu gerekli'),
    body('targetItemTypeCode')
      .notEmpty()
      .withMessage('Hedef ItemType kodu gerekli'),
    body('relationshipType')
      .isIn(['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'])
      .withMessage('Geçerli ilişki türü gerekli'),
    validateRequest
  ],
  createAssociationRule
);

// Association kurallarını listele
router.get('/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Sayfa numarası 1 veya daha büyük olmalı'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit 1-100 arası olmalı'),
    validateRequest
  ],
  getAssociationRules
);

// Belirli bir association kuralını getir
router.get('/:code',
  [
    param('code')
      .notEmpty()
      .withMessage('Kural kodu gerekli'),
    validateRequest
  ],
  getAssociationRule
);

// Association kuralını güncelle
router.put('/:code',
  [
    param('code')
      .notEmpty()
      .withMessage('Kural kodu gerekli'),
    validateRequest
  ],
  updateAssociationRule
);

// Association kuralını sil
router.delete('/:code',
  [
    param('code')
      .notEmpty()
      .withMessage('Kural kodu gerekli'),
    validateRequest
  ],
  deleteAssociationRule
);

/**
 * Association Operations with Rules
 */

// Kural tabanlı filtrelenmiş item'ları getir
router.get('/:ruleCode/items/:sourceItemId',
  [
    param('ruleCode')
      .notEmpty()
      .withMessage('Kural kodu gerekli'),
    param('sourceItemId')
      .isMongoId()
      .withMessage('Geçerli source item ID gerekli'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Sayfa numarası 1 veya daha büyük olmalı'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit 1-100 arası olmalı'),
    validateRequest
  ],
  getFilteredItems
);

// Association metadata bilgisi
router.get('/:ruleCode/metadata/:sourceItemId',
  [
    param('ruleCode')
      .notEmpty()
      .withMessage('Kural kodu gerekli'),
    param('sourceItemId')
      .isMongoId()
      .withMessage('Geçerli source item ID gerekli'),
    validateRequest
  ],
  getAssociationMetadata
);

// Kural tabanlı association oluştur
router.post('/:ruleCode/associate/:sourceItemId',
  [
    param('ruleCode')
      .notEmpty()
      .withMessage('Kural kodu gerekli'),
    param('sourceItemId')
      .isMongoId()
      .withMessage('Geçerli source item ID gerekli'),
    body('targetItemIds')
      .isArray({ min: 1 })
      .withMessage('En az bir target item ID gerekli'),
    body('targetItemIds.*')
      .isMongoId()
      .withMessage('Geçerli target item ID\'leri gerekli'),
    validateRequest
  ],
  createAssociationWithRule
);

/**
 * ItemType Integration
 */

// ItemType için association kurallarını getir
router.get('/itemtype/:itemTypeCode',
  [
    param('itemTypeCode')
      .notEmpty()
      .withMessage('ItemType kodu gerekli'),
    query('includeInactive')
      .optional()
      .isBoolean()
      .withMessage('includeInactive boolean değer olmalı'),
    validateRequest
  ],
  getItemTypeAssociationRules
);

export default router;
