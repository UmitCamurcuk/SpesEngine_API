"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const historyController_1 = require("../controllers/historyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Tüm route'lar korumalı olmalı
router.use(authMiddleware_1.protect);
// Tüm geçmiş kayıtlarını getir
router.get('/', historyController_1.getHistory);
// Belirli bir varlığın geçmiş kayıtlarını getir
router.get('/:entityId', historyController_1.getEntityHistory);
exports.default = router;
