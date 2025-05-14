"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itemController_1 = require("../controllers/itemController");
const router = express_1.default.Router();
// GET tüm öğeleri getir - koruma kaldırıldı (geliştirme aşamasında)
router.get('/', itemController_1.getItems);
// GET belirli bir öğeyi getir - koruma kaldırıldı (geliştirme aşamasında)
router.get('/:id', itemController_1.getItemById);
// POST yeni öğe oluştur - koruma kaldırıldı (geliştirme aşamasında)
router.post('/', itemController_1.createItem);
// PUT öğeyi güncelle - koruma kaldırıldı (geliştirme aşamasında)
router.put('/:id', itemController_1.updateItem);
// DELETE öğeyi sil - koruma kaldırıldı (geliştirme aşamasında)
router.delete('/:id', itemController_1.deleteItem);
exports.default = router;
