"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const attributeController_1 = require("../controllers/attributeController");
const router = express_1.default.Router();
// GET tüm öznitelikleri getir
router.get('/', auth_1.protect, attributeController_1.getAttributes);
// GET tek bir özniteliği getir
router.get('/:id', auth_1.protect, attributeController_1.getAttributeById);
// POST yeni öznitelik oluştur
router.post('/', auth_1.protect, attributeController_1.createAttribute);
// PUT özniteliği güncelle
router.put('/:id', auth_1.protect, attributeController_1.updateAttribute);
// DELETE özniteliği sil
router.delete('/:id', auth_1.protect, attributeController_1.deleteAttribute);
exports.default = router;
