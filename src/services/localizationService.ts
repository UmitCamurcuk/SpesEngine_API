import Localization, { ILocalization } from '../models/Localization';
import SystemSettings from '../models/SystemSettings';

interface TranslationCreateData {
  key: string;
  namespace?: string;
  translations: {
    [lang: string]: string;
  };
}

interface TranslationUpdateData {
  key: string;
  namespace?: string;
  translations: {
    [lang: string]: string;
  };
}

class LocalizationService {
  // Çeviri ekleme/güncelleme
  async upsertTranslation(data: TranslationCreateData): Promise<ILocalization> {
    const { key, namespace = 'common', translations } = data;
    
    const localization = await Localization.findOneAndUpdate(
      { key, namespace },
      { translations },
      { upsert: true, new: true }
    );
    
    return localization;
  }
  
  // Tüm çevirileri belirli bir dil için getir
  async getAllTranslationsForLanguage(lang: string): Promise<Record<string, Record<string, string>>> {
    
    // Ham dokümanlar olarak çevirileri al
    const allTranslations = await Localization.find({}).lean();
    
    // Namespace'lere göre grupla
    const result: Record<string, Record<string, string>> = {};
    
    // Önce namespace'leri oluştur
    allTranslations.forEach(item => {
      if (!result[item.namespace]) {
        result[item.namespace] = {};
      }
    });
    
    // Çevirileri ekle
    for (const item of allTranslations) {
      // Eğer bu namespace ve dilde çeviri varsa, ekle
      if (item.translations && item.translations[lang]) {
        result[item.namespace][item.key] = item.translations[lang];
      }
    }
    
    return result;
  }
  
  // Bir çeviriyi tüm dillerde getir
  async getTranslation(key: string, namespace = 'common'): Promise<ILocalization | null> {
    const translation = await Localization.findOne({ key, namespace });
    
    if (!translation) return null;
    
    return translation;
  }
  
  // Çeviri sil
  async deleteTranslation(key: string, namespace = 'common'): Promise<boolean> {
    const result = await Localization.deleteOne({ key, namespace });
    return result.deletedCount > 0;
  }
  
  // Desteklenen dilleri getir (sistem ayarlarından)
  async getSupportedLanguages(): Promise<string[]> {
    try {
      // Önce sistem ayarlarından desteklenen dilleri al
      const systemSettings = await SystemSettings.findOne().lean();
      
      if (systemSettings && systemSettings.supportedLanguages && systemSettings.supportedLanguages.length > 0) {
        return systemSettings.supportedLanguages;
      }
      
      // Eğer sistem ayarlarında yoksa, fallback olarak çevirilerden al
      const translations = await Localization.find({}).lean();
      
      const langSet = new Set<string>();
      
      translations.forEach(item => {
        if (item.translations) {
          // Obje anahtarlarını al
          const langs = Object.keys(item.translations);
          langs.forEach(lang => langSet.add(lang));
        }
      });
      
      const languagesFromTranslations = Array.from(langSet);
      
      // Eğer hiç dil bulunamazsa varsayılan dilleri döndür
      return languagesFromTranslations.length > 0 ? languagesFromTranslations : ['tr', 'en'];
    } catch (error) {
      console.error('Desteklenen diller alınırken hata oluştu:', error);
      // Hata durumunda varsayılan dilleri döndür
      return ['tr', 'en'];
    }
  }
}

export default new LocalizationService(); 