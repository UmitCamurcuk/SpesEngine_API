import express from 'express';
import { getTranslations, upsertTranslation, getSupportedLanguages } from '../controllers/localizationController';
import { protect, checkPermission } from '../middleware/auth';

const router = express.Router();

// Çevirileri getirme endpoint'leri herkes için erişilebilir olmalı
router.get('/languages', getSupportedLanguages);
router.get('/:lang', getTranslations);

// Sadece yönetim işlemleri için koruma ekle
router.use(protect);

// Çeviri ekle/güncelle - sadece admin veya localization:write izni olanlar
router.post('/', checkPermission('localization:write'), upsertTranslation);

export default router; 