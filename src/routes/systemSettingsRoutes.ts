import express from 'express';
import { authenticateToken, checkAccess } from '../middleware/auth.middleware';
import { getSettings, updateSettings, updateSection, updateLogo } from '../controllers/systemSettingsController';

const router = express.Router();

// Tüm rotalar için token kontrolü
router.use(authenticateToken);

// Tüm ayarları getir
router.get('/', checkAccess(['SETTINGS_VIEW']), getSettings);

// Tüm ayarları güncelle
router.put('/', checkAccess(['SETTINGS_MANAGE']), updateSettings);

// Belirli bir bölümü güncelle
router.put('/:section', checkAccess(['SETTINGS_MANAGE']), updateSection);

// Logo güncelle
router.put('/logo', checkAccess(['SETTINGS_MANAGE']), updateLogo);

export default router; 