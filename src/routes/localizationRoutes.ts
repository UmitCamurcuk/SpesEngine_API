import express from 'express';
import { getTranslations, upsertTranslation, getSupportedLanguages } from '../controllers/localizationController';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

// Çevirileri getirme endpoint'leri herkes için erişilebilir olmalı
router.get('/languages', getSupportedLanguages);
router.get('/:lang', getTranslations);

// Çeviri ekle/güncelle - sadece admin veya localization:write izni olanlar
router.post('/', protect, checkPermission('localization:write'), upsertTranslation);

export default router; 