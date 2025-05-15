import { Request, Response, NextFunction } from 'express';
import localizationService from '../services/localizationService';

// Express Request tipini genişlet
declare global {
  namespace Express {
    interface Request {
      translations?: Record<string, Record<string, string>>;
    }
  }
}

// Cache mekanizması
let translationsCache: Record<string, Record<string, Record<string, string>>> = {};
let lastCacheTime: Record<string, number> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

/**
 * İstenen dildeki çevirileri alıp request nesnesine ekleyen middleware
 */
export const getTranslationsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Accept-Language header'ından dil bilgisini al
    const acceptLanguage = req.headers['accept-language'] || 'tr';
    const lang = acceptLanguage.split(',')[0].trim().substring(0, 2);
    
    // Cache kontrolü
    const now = Date.now();
    if (!translationsCache[lang] || !lastCacheTime[lang] || (now - lastCacheTime[lang] > CACHE_TTL)) {
      // Cache'i güncelle
      translationsCache[lang] = await localizationService.getAllTranslationsForLanguage(lang);
      lastCacheTime[lang] = now;
    }
    
    // Çevirileri request nesnesine ekle
    req.translations = translationsCache[lang];
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Varlık çevirilerini yanıta ekleyen middleware
 */
export const translateEntityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Orijinal json metodunu sakla
  const originalJson = res.json;
  
  // Dil bilgisini al
  const acceptLanguage = req.headers['accept-language'] || 'tr';
  const lang = acceptLanguage.split(',')[0].trim().substring(0, 2);
  
  // Json metodunu override et
  res.json = function(body: any) {
    // Veri içinde çeviri anahtarları varsa çevir
    if (body && body.data) {
      // Tekil obje
      if (body.data.nameKey || body.data.descriptionKey) {
        translateEntity(body.data, lang, req);
      }
      
      // Dizi
      if (Array.isArray(body.data)) {
        body.data.forEach((item: any) => {
          if (item.nameKey || item.descriptionKey) {
            translateEntity(item, lang, req);
          }
        });
      }
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * Bir varlığı çevir
 */
function translateEntity(entity: any, lang: string, req: Request) {
  // Eğer translations hazırsa kullan
  if (req.translations) {
    if (entity.nameKey) {
      const [namespace, key] = entity.nameKey.includes('.') 
        ? entity.nameKey.split('.') 
        : ['common', entity.nameKey];
      
      if (req.translations[namespace] && req.translations[namespace][key]) {
        entity.translatedName = req.translations[namespace][key];
      }
    }
    
    if (entity.descriptionKey) {
      const [namespace, key] = entity.descriptionKey.includes('.')
        ? entity.descriptionKey.split('.')
        : ['common', entity.descriptionKey];
      
      if (req.translations[namespace] && req.translations[namespace][key]) {
        entity.translatedDescription = req.translations[namespace][key];
      }
    }
  }
} 