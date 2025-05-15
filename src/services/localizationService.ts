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
    console.log(`[LocalizationService] getAllTranslationsForLanguage çağrıldı. Dil: ${lang}`);
    
    // Ham dokümanlar olarak çevirileri al
    const allTranslations = await Localization.find({}).lean();
    console.log(`[LocalizationService] Veritabanında ${allTranslations.length} çeviri bulundu.`);
    
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
    
    console.log(`[LocalizationService] Dönüş yapılıyor. Namespace sayısı: ${Object.keys(result).length}`);
    return result;
  }
  
  // Bir çeviriyi tüm dillerde getir
  async getTranslation(key: string, namespace = 'common'): Promise<Record<string, string> | null> {
    const translation = await Localization.findOne({ key, namespace }).lean();
    
    if (!translation) return null;
    
    return translation.translations as Record<string, string>;
  }
  
  // Çeviri sil
  async deleteTranslation(key: string, namespace = 'common'): Promise<boolean> {
    const result = await Localization.deleteOne({ key, namespace });
    return result.deletedCount > 0;
  }
  
  // Desteklenen dilleri getir (unique dil kodlarını bul)
  async getSupportedLanguages(): Promise<string[]> {
    const translations = await Localization.find({}).lean();
    
    const langSet = new Set<string>();
    
    translations.forEach(item => {
      if (item.translations) {
        // Obje anahtarlarını al
        const langs = Object.keys(item.translations);
        langs.forEach(lang => langSet.add(lang));
      }
    });
    
    return Array.from(langSet);
  }
}

export default new LocalizationService(); 