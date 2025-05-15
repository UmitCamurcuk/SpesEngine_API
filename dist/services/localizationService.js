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
const Localization_1 = __importDefault(require("../models/Localization"));
class LocalizationService {
    // Çeviri ekleme/güncelleme
    upsertTranslation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, namespace = 'common', translations } = data;
            const localization = yield Localization_1.default.findOneAndUpdate({ key, namespace }, { translations }, { upsert: true, new: true });
            return localization;
        });
    }
    // Tüm çevirileri belirli bir dil için getir
    getAllTranslationsForLanguage(lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const allTranslations = yield Localization_1.default.find({});
            const result = {};
            // Namespace'lere göre grupla
            allTranslations.forEach(item => {
                if (!result[item.namespace]) {
                    result[item.namespace] = {};
                }
                // Sadece istenen dildeki çeviriyi al
                // MongoDB'de Map JavaScript objesine çevriliyor, doğrudan erişebiliriz
                if (item.translations && typeof item.translations === 'object') {
                    const translationsObj = item.translations;
                    if (translationsObj[lang]) {
                        result[item.namespace][item.key] = translationsObj[lang];
                    }
                }
            });
            return result;
        });
    }
    // Bir çeviriyi tüm dillerde getir
    getTranslation(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, namespace = 'common') {
            const translation = yield Localization_1.default.findOne({ key, namespace });
            if (!translation)
                return null;
            // Map'i düz objeye çevir - MongoDB Map'i zaten JavaScript objesi olarak döndürüyor
            const translationsObj = {};
            if (translation.translations && typeof translation.translations === 'object') {
                // Doğrudan obje olarak ele al
                return translation.translations;
            }
            return translationsObj;
        });
    }
    // Çeviri sil
    deleteTranslation(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, namespace = 'common') {
            const result = yield Localization_1.default.deleteOne({ key, namespace });
            return result.deletedCount > 0;
        });
    }
    // Desteklenen dilleri getir (unique dil kodlarını bul)
    getSupportedLanguages() {
        return __awaiter(this, void 0, void 0, function* () {
            const translations = yield Localization_1.default.find({});
            const langSet = new Set();
            translations.forEach(item => {
                if (item.translations && typeof item.translations === 'object') {
                    // Obje anahtarlarını al
                    const langs = Object.keys(item.translations);
                    langs.forEach(lang => langSet.add(lang));
                }
            });
            return Array.from(langSet);
        });
    }
}
exports.default = new LocalizationService();
