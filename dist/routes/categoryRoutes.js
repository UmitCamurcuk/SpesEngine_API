"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
// GET tüm kategorileri getir (filtreleme ve sayfalama ile)
router.get('/', auth_1.protect, categoryController_1.getCategories);
// GET tek bir kategoriyi getir
router.get('/:id', auth_1.protect, categoryController_1.getCategoryById);
// POST yeni kategori oluştur
router.post('/', auth_1.protect, categoryController_1.createCategory);
// PUT kategoriyi güncelle
router.put('/:id', auth_1.protect, categoryController_1.updateCategory);
// DELETE kategoriyi sil
router.delete('/:id', auth_1.protect, categoryController_1.deleteCategory);
exports.default = router;
