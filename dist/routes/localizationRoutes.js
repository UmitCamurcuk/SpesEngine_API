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
// Çeviri işlemleri için yetkilendirme gerekli
router.get('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.checkAccess)(['TRANSLATIONS_VIEW']), localizationController_1.getTranslations);
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.checkAccess)(['TRANSLATIONS_MANAGE']), localizationController_1.upsertTranslation);
exports.default = router;
