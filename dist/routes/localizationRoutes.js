"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const localizationController_1 = require("../controllers/localizationController");
const router = express_1.default.Router();
// Dil listesi herkese açık
router.get('/languages', localizationController_1.getSupportedLanguages);
// Belirli bir dil için çevirileri getir (public endpoint)
router.get('/:lang', localizationController_1.getTranslations);
// ID'ye göre çeviri getir
router.get('/details/:id', localizationController_1.getTranslationById);
// ID'ye göre çeviri güncelle
router.put('/details/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.checkAccess)(['TRANSLATIONS_MANAGE']), localizationController_1.updateTranslationById);
// Çeviri işlemleri için yetkilendirme gerekli
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.checkAccess)(['TRANSLATIONS_MANAGE']), localizationController_1.upsertTranslation);
exports.default = router;
