import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import { getTranslations, upsertTranslation, getSupportedLanguages, getTranslationById, updateTranslationById } from '../controllers/localizationController';

const router = express.Router();

// Dil listesi herkese açık
router.get('/languages', getSupportedLanguages);

// Belirli bir dil için çevirileri getir (public endpoint)
router.get('/:lang', getTranslations);

// ID'ye göre çeviri getir
router.get('/details/:id', getTranslationById);

// ID'ye göre çeviri güncelle
router.put('/details/:id', authenticateToken, checkAccess(['TRANSLATIONS_MANAGE']), updateTranslationById);

// Çeviri işlemleri için yetkilendirme gerekli
router.post('/', authenticateToken, checkAccess(['TRANSLATIONS_MANAGE']), upsertTranslation);

export default router; 