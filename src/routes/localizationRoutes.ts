import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import { getTranslations, upsertTranslation, getSupportedLanguages, getTranslationById, updateTranslationById, getLocalizations, deleteLocalization } from '../controllers/localizationController';

const router = express.Router();

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Localization routes çalışıyor',
    path: req.path,
    method: req.method,
    headers: req.headers
  });
});

// Dil listesi herkese açık
router.get('/languages', getSupportedLanguages);

// ID'ye göre çeviri getir
router.get('/details/:id', getTranslationById);

// Tüm çevirileri getir (liste sayfası için)
router.get('/', authenticateToken, checkAccess(['TRANSLATIONS_MANAGE']), getLocalizations);

// Belirli bir dil için çevirileri getir (public endpoint)
router.get('/:lang', getTranslations);

// ID'ye göre çeviri güncelle
router.put('/details/:id', authenticateToken, checkAccess(['TRANSLATIONS_MANAGE']), updateTranslationById);

// ID'ye göre çeviri sil
router.delete('/details/:id', authenticateToken, checkAccess(['TRANSLATIONS_MANAGE']), deleteLocalization);

// Çeviri işlemleri için yetkilendirme gerekli
router.post('/', authenticateToken, checkAccess(['TRANSLATIONS_MANAGE']), upsertTranslation);

export default router; 