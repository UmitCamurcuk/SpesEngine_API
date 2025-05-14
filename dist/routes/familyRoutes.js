"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const familyController_1 = require("../controllers/familyController");
const router = express_1.default.Router();
// GET tüm aileleri getir
router.get('/', auth_1.protect, familyController_1.getFamilies);
// GET tek bir aileyi getir
router.get('/:id', auth_1.protect, familyController_1.getFamilyById);
// POST yeni aile oluştur
router.post('/', auth_1.protect, familyController_1.createFamily);
// PUT aileyi güncelle
router.put('/:id', auth_1.protect, familyController_1.updateFamily);
// DELETE aileyi sil
router.delete('/:id', auth_1.protect, familyController_1.deleteFamily);
exports.default = router;
