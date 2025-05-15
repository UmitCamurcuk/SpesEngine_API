"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const localizationController_1 = require("../controllers/localizationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Çevirileri getirme endpoint'leri herkes için erişilebilir olmalı
router.get('/languages', localizationController_1.getSupportedLanguages);
router.get('/:lang', localizationController_1.getTranslations);
// Çeviri ekle/güncelle - sadece admin veya localization:write izni olanlar
router.post('/', auth_1.protect, (0, auth_1.checkPermission)('localization:write'), localizationController_1.upsertTranslation);
exports.default = router;
