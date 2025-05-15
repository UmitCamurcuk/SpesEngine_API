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
exports.getSupportedLanguages = exports.upsertTranslation = exports.getTranslations = void 0;
const localizationService_1 = __importDefault(require("../services/localizationService"));
// Tüm çevirileri belirli bir dil için getir
const getTranslations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.params.lang || 'tr';
        const translations = yield localizationService_1.default.getAllTranslationsForLanguage(lang);
        res.status(200).json({
            success: true,
            data: translations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Çeviriler getirilirken bir hata oluştu'
        });
    }
});
exports.getTranslations = getTranslations;
// Çeviri ekle veya güncelle
const upsertTranslation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, namespace, translations } = req.body;
        const result = yield localizationService_1.default.upsertTranslation({
            key,
            namespace,
            translations
        });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Çeviri eklenirken/güncellenirken bir hata oluştu'
        });
    }
});
exports.upsertTranslation = upsertTranslation;
// Desteklenen dilleri getir
const getSupportedLanguages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const languages = yield localizationService_1.default.getSupportedLanguages();
        res.status(200).json({
            success: true,
            data: languages
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Desteklenen diller getirilirken bir hata oluştu'
        });
    }
});
exports.getSupportedLanguages = getSupportedLanguages;
