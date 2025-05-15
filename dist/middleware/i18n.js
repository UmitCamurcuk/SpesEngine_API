"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateEntityMiddleware = exports.getTranslationsMiddleware = void 0;
const localizationService_1 = __importDefault(require("../services/localizationService"));
// Cache mekanizması
let translationsCache = {};
let lastCacheTime = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika
/**
 * İstenen dildeki çevirileri alıp request nesnesine ekleyen middleware
 */
const getTranslationsMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Accept-Language header'ından dil bilgisini al
        const acceptLanguage = req.headers['accept-language'] || 'tr';
        const lang = acceptLanguage.split(',')[0].trim().substring(0, 2);
        // Cache kontrolü
        const now = Date.now();
        if (!translationsCache[lang] || !lastCacheTime[lang] || (now - lastCacheTime[lang] > CACHE_TTL)) {
            // Cache'i güncelle
            translationsCache[lang] = yield localizationService_1.default.getAllTranslationsForLanguage(lang);
            lastCacheTime[lang] = now;
        }
        // Çevirileri request nesnesine ekle
        req.translations = translationsCache[lang];
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.getTranslationsMiddleware = getTranslationsMiddleware;
/**
 * Varlık çevirilerini yanıta ekleyen middleware
 */
const translateEntityMiddleware = (req, res, next) => {
    // Orijinal json metodunu sakla
    const originalJson = res.json;
    // Dil bilgisini al
    const acceptLanguage = req.headers['accept-language'] || 'tr';
    const lang = acceptLanguage.split(',')[0].trim().substring(0, 2);
    // Json metodunu override et
    res.json = function (body) {
        // Veri içinde çeviri anahtarları varsa çevir
        if (body && body.data) {
            // Tekil obje
            if (body.data.nameKey || body.data.descriptionKey) {
                translateEntity(body.data, lang, req);
            }
            // Dizi
            if (Array.isArray(body.data)) {
                body.data.forEach((item) => {
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
exports.translateEntityMiddleware = translateEntityMiddleware;
/**
 * Bir varlığı çevir
 */
function translateEntity(entity, lang, req) {
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
