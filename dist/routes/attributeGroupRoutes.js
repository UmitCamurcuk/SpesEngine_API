"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const attributeGroupController_1 = require("../controllers/attributeGroupController");
const router = express_1.default.Router();
// GET tüm öznitelik gruplarını getir
router.get('/', auth_1.protect, attributeGroupController_1.getAttributeGroups);
// GET tek bir öznitelik grubunu getir
router.get('/:id', auth_1.protect, attributeGroupController_1.getAttributeGroupById);
// POST yeni öznitelik grubu oluştur
router.post('/', auth_1.protect, attributeGroupController_1.createAttributeGroup);
// PUT öznitelik grubunu güncelle
router.put('/:id', auth_1.protect, attributeGroupController_1.updateAttributeGroup);
// DELETE öznitelik grubunu sil
router.delete('/:id', auth_1.protect, attributeGroupController_1.deleteAttributeGroup);
exports.default = router;
