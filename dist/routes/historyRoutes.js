"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const historyController_1 = require("../controllers/historyController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Tüm route'lar korumalı olmalı
router.use(auth_1.protect);
// Tüm geçmiş kayıtlarını getir - history:read izni gerekli
router.get('/', (0, auth_1.checkPermission)('history:read'), historyController_1.getHistory);
// Belirli bir varlığın geçmiş kayıtlarını getir - history:read izni gerekli
router.get('/:entityId', (0, auth_1.checkPermission)('history:read'), historyController_1.getEntityHistory);
exports.default = router;
