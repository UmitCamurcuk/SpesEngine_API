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
const SystemSettings_1 = __importDefault(require("../models/SystemSettings"));
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
            // Ham dokümanlar olarak çevirileri al
            const allTranslations = yield Localization_1.default.find({}).lean();
            // Namespace'lere göre grupla
            const result = {};
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
        });
    }
    // Bir çeviriyi tüm dillerde getir
    getTranslation(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, namespace = 'common') {
            const translation = yield Localization_1.default.findOne({ key, namespace });
            if (!translation)
                return null;
            return translation;
        });
    }
    // Çeviri sil
    deleteTranslation(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, namespace = 'common') {
            const result = yield Localization_1.default.deleteOne({ key, namespace });
            return result.deletedCount > 0;
        });
    }
    // Çeviri sil (ID ile)
    deleteLocalization(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Localization_1.default.findByIdAndDelete(id);
            return result;
        });
    }
    // Tüm çevirileri getir (liste sayfası için)
    getLocalizations(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search, namespace, key, translationValue, language, sortBy, sortOrder } = params;
            const skip = (page - 1) * limit;
            // Filtreleme kriterleri
            const filter = {};
            if (search) {
                filter.$or = [
                    { key: { $regex: search, $options: 'i' } },
                    { namespace: { $regex: search, $options: 'i' } }
                ];
            }
            if (namespace) {
                filter.namespace = namespace;
            }
            if (key) {
                filter.key = { $regex: key, $options: 'i' };
            }
            if (translationValue) {
                filter['translations'] = { $regex: translationValue, $options: 'i' };
            }
            if (language) {
                filter[`translations.${language}`] = { $exists: true };
            }
            // Toplam kayıt sayısını al
            const total = yield Localization_1.default.countDocuments(filter);
            // Sıralama
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            // Verileri getir
            const data = yield Localization_1.default.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean();
            // Sayfa sayısını hesapla
            const pages = Math.ceil(total / limit);
            return {
                data,
                total,
                page,
                pages
            };
        });
    }
    // Desteklenen dilleri getir (sistem ayarlarından)
    getSupportedLanguages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Önce sistem ayarlarından desteklenen dilleri al
                const systemSettings = yield SystemSettings_1.default.findOne().lean();
                if (systemSettings && systemSettings.supportedLanguages && systemSettings.supportedLanguages.length > 0) {
                    return systemSettings.supportedLanguages;
                }
                // Eğer sistem ayarlarında yoksa, fallback olarak çevirilerden al
                const translations = yield Localization_1.default.find({}).lean();
                const langSet = new Set();
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
            }
            catch (error) {
                console.error('Desteklenen diller alınırken hata oluştu:', error);
                // Hata durumunda varsayılan dilleri döndür
                return ['tr', 'en'];
            }
        });
    }
}
exports.default = new LocalizationService();
