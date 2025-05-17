import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import { getTranslations, upsertTranslation, getSupportedLanguages } from '../controllers/localizationController';

const router = express.Router();

// Dil listesi herkese açık
router.get('/languages', getSupportedLanguages);

// Çeviri işlemleri için yetkilendirme gerekli
router.get('/', authenticateToken, checkAccess(['TRANSLATIONS_VIEW']), getTranslations);
router.post('/', authenticateToken, checkAccess(['TRANSLATIONS_MANAGE']), upsertTranslation);

export default router; 