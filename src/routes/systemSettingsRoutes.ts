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

// Tema ayarlarını güncelle
router.put('/theme', checkAccess(['SETTINGS_MANAGE']), async (req, res) => {
  try {
    const { mode, primaryColor, accentColor, enableDarkMode, defaultDarkMode, ...rest } = req.body;
    const themeSettings = {
      theme: {
        mode,
        primaryColor,
        accentColor,
        enableDarkMode,
        defaultDarkMode
      }
    };
    const result = await updateSettings(req, res);
    return result;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Tema ayarları güncellenirken bir hata oluştu'
    });
  }
});

export default router; 