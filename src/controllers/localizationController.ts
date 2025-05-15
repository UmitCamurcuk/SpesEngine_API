import { Request, Response, NextFunction } from 'express';
import localizationService from '../services/localizationService';

// Tüm çevirileri belirli bir dil için getir
export const getTranslations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lang = req.params.lang || 'tr';
    
    const translations = await localizationService.getAllTranslationsForLanguage(lang);
    
    res.status(200).json({
      success: true,
      data: translations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Çeviriler getirilirken bir hata oluştu'
    });
  }
};

// Çeviri ekle veya güncelle
export const upsertTranslation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { key, namespace, translations } = req.body;
    
    const result = await localizationService.upsertTranslation({
      key,
      namespace,
      translations
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Çeviri eklenirken/güncellenirken bir hata oluştu'
    });
  }
};

// Desteklenen dilleri getir
export const getSupportedLanguages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const languages = await localizationService.getSupportedLanguages();
    
    res.status(200).json({
      success: true,
      data: languages
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Desteklenen diller getirilirken bir hata oluştu'
    });
  }
}; 