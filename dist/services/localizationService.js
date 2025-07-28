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
    // Tüm çevirileri getir (liste sayfası için)
    getLocalizations(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, search, namespace, key, translationValue, language, sortBy = 'createdAt', sortOrder = 'desc' } = params;
            const skip = (page - 1) * limit;
            // Filtre oluştur
            const filter = {};
            // Eski search parametresi desteği (geriye uyumluluk)
            if (search) {
                const searchRegex = { $regex: search, $options: 'i' };
                const supportedLanguages = yield this.getSupportedLanguages();
                const searchConditions = [
                    { key: searchRegex },
                    { namespace: searchRegex }
                ];
                supportedLanguages.forEach(lang => {
                    searchConditions.push({ [`translations.${lang}`]: searchRegex });
                });
                filter.$or = searchConditions;
            }
            // Yeni gelişmiş arama parametreleri - Akıllı arama
            const searchConditions = [];
            if (namespace) {
                searchConditions.push({ namespace: { $regex: namespace, $options: 'i' } });
            }
            if (key) {
                searchConditions.push({ key: { $regex: key, $options: 'i' } });
            }
            if (translationValue) {
                const translationRegex = { $regex: translationValue, $options: 'i' };
                const supportedLanguages = yield this.getSupportedLanguages();
                if (language) {
                    // Belirli bir dilde çeviri değeri arama
                    searchConditions.push({ [`translations.${language}`]: translationRegex });
                }
                else {
                    // Tüm dillerde çeviri değeri arama
                    const translationConditions = [];
                    supportedLanguages.forEach(lang => {
                        translationConditions.push({ [`translations.${lang}`]: translationRegex });
                    });
                    searchConditions.push({ $or: translationConditions });
                }
            }
            else if (language) {
                // Sadece dil filtresi (çeviri değeri olmadan)
                const supportedLanguages = yield this.getSupportedLanguages();
                if (supportedLanguages.includes(language)) {
                    searchConditions.push({ [`translations.${language}`]: { $exists: true, $ne: null } });
                }
            }
            // Eğer arama koşulları varsa, bunları AND ile birleştir
            if (searchConditions.length > 0) {
                if (filter.$or) {
                    // Eğer eski search parametresi varsa, yeni koşullarla AND yap
                    filter.$and = [
                        { $or: filter.$or },
                        { $and: searchConditions }
                    ];
                    delete filter.$or;
                }
                else {
                    filter.$and = searchConditions;
                }
            }
            // Debug: Filtre koşullarını logla
            console.log('🔍 Search conditions:', searchConditions);
            console.log('🔍 Final filter:', JSON.stringify(filter, null, 2));
            // Sıralama
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            // Toplam sayı
            const total = yield Localization_1.default.countDocuments(filter);
            // Verileri getir
            const localizations = yield Localization_1.default.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();
            return {
                localizations,
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            };
        });
    }
    // ID'ye göre çeviri sil
    deleteLocalization(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const localization = yield Localization_1.default.findByIdAndDelete(id);
            return localization;
        });
    }
}
exports.default = new LocalizationService();
