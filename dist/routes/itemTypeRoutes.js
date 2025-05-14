"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const itemTypeController_1 = require("../controllers/itemTypeController");
const router = express_1.default.Router();
// GET tüm öğe tiplerini getir
router.get('/', auth_1.protect, itemTypeController_1.getItemTypes);
// GET tek bir öğe tipini getir
router.get('/:id', auth_1.protect, itemTypeController_1.getItemTypeById);
// POST yeni öğe tipi oluştur
router.post('/', auth_1.protect, itemTypeController_1.createItemType);
// PUT öğe tipini güncelle
router.put('/:id', auth_1.protect, itemTypeController_1.updateItemType);
// DELETE öğe tipini sil
router.delete('/:id', auth_1.protect, itemTypeController_1.deleteItemType);
exports.default = router;
