import Localization, { ILocalization } from '../models/Localization';

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
    const allTranslations = await Localization.find({});
    
    const result: Record<string, Record<string, string>> = {};
    
    // Namespace'lere göre grupla
    allTranslations.forEach(item => {
      if (!result[item.namespace]) {
        result[item.namespace] = {};
      }
      
      // Sadece istenen dildeki çeviriyi al
      // MongoDB'de Map JavaScript objesine çevriliyor, doğrudan erişebiliriz
      if (item.translations && typeof item.translations === 'object') {
        const translationsObj = item.translations as Record<string, string>;
        if (translationsObj[lang]) {
          result[item.namespace][item.key] = translationsObj[lang];
        }
      }
    });
    
    return result;
  }
  
  // Bir çeviriyi tüm dillerde getir
  async getTranslation(key: string, namespace = 'common'): Promise<Record<string, string> | null> {
    const translation = await Localization.findOne({ key, namespace });
    
    if (!translation) return null;
    
    // Map'i düz objeye çevir - MongoDB Map'i zaten JavaScript objesi olarak döndürüyor
    const translationsObj: Record<string, string> = {};
    
    if (translation.translations && typeof translation.translations === 'object') {
      // Doğrudan obje olarak ele al
      return translation.translations as Record<string, string>;
    }
    
    return translationsObj;
  }
  
  // Çeviri sil
  async deleteTranslation(key: string, namespace = 'common'): Promise<boolean> {
    const result = await Localization.deleteOne({ key, namespace });
    return result.deletedCount > 0;
  }
  
  // Desteklenen dilleri getir (unique dil kodlarını bul)
  async getSupportedLanguages(): Promise<string[]> {
    const translations = await Localization.find({});
    
    const langSet = new Set<string>();
    
    translations.forEach(item => {
      if (item.translations && typeof item.translations === 'object') {
        // Obje anahtarlarını al
        const langs = Object.keys(item.translations as Record<string, string>);
        langs.forEach(lang => langSet.add(lang));
      }
    });
    
    return Array.from(langSet);
  }
}

export default new LocalizationService(); 