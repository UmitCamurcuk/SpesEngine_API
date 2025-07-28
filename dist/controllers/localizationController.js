"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteLocalization = exports.getLocalizations = exports.getSupportedLanguages = exports.updateTranslationById = exports.getTranslationById = exports.upsertTranslation = exports.getTranslations = void 0;
const localizationService_1 = __importDefault(require("../services/localizationService"));
const historyService_1 = __importDefault(require("../services/historyService"));
const History_1 = require("../models/History");
const Entity_1 = require("../models/Entity");
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
        // Mevcut çeviriyi kontrol et
        const existingTranslation = yield localizationService_1.default.getTranslation(key, namespace);
        const isUpdate = !!existingTranslation;
        const result = yield localizationService_1.default.upsertTranslation({
            key,
            namespace,
            translations
        });
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                const localizationId = `${namespace}:${key}`;
                yield historyService_1.default.recordHistory({
                    entityId: localizationId,
                    entityType: Entity_1.EntityType.LOCALIZATION,
                    action: isUpdate ? History_1.ActionType.UPDATE : History_1.ActionType.CREATE,
                    userId: userId,
                    previousData: isUpdate ? existingTranslation : undefined,
                    newData: {
                        key,
                        namespace,
                        translations
                    }
                });
                // İlişkili entity'lere history kaydı yap
                yield recordRelatedEntityHistory(namespace, key, userId, isUpdate);
            }
            catch (historyError) {
                console.error('History creation failed for localization:', historyError);
                // History hatası localization işlemini engellemesin
            }
        }
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
// ID'ye göre çeviri getir (hem MongoDB ID hem de namespace:key formatını destekler)
const getTranslationById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const Localization = (yield Promise.resolve().then(() => __importStar(require('../models/Localization')))).default;
        let localization;
        // ID MongoDB ObjectId formatında mı kontrol et
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // MongoDB ObjectId ile ara
            localization = yield Localization.findById(id);
        }
        else if (id.includes(':')) {
            // namespace:key formatında ise parse et
            const [namespace, key] = id.split(':');
            if (namespace && key) {
                localization = yield localizationService_1.default.getTranslation(key, namespace);
            }
        }
        if (!localization) {
            res.status(404).json({
                success: false,
                message: 'Çeviri bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: localization
        });
    }
    catch (error) {
        console.error('Get translation by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Çeviri getirilirken bir hata oluştu'
        });
    }
});
exports.getTranslationById = getTranslationById;
// ID'ye göre çeviri güncelle (hem MongoDB ID hem de namespace:key formatını destekler)
const updateTranslationById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { key, namespace, translations } = req.body;
        const Localization = (yield Promise.resolve().then(() => __importStar(require('../models/Localization')))).default;
        let existingTranslation;
        let updateMethod = 'mongodb';
        // ID MongoDB ObjectId formatında mı kontrol et
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // MongoDB ObjectId ile ara
            existingTranslation = yield Localization.findById(id);
            updateMethod = 'mongodb';
        }
        else if (id.includes(':')) {
            // namespace:key formatında ise parse et
            const [currentNamespace, currentKey] = id.split(':');
            if (currentNamespace && currentKey) {
                existingTranslation = yield localizationService_1.default.getTranslation(currentKey, currentNamespace);
                updateMethod = 'composite';
            }
        }
        if (!existingTranslation) {
            res.status(404).json({
                success: false,
                message: 'Çeviri bulunamadı'
            });
            return;
        }
        let updatedTranslation;
        if (updateMethod === 'mongodb') {
            // MongoDB ID ile güncelleme
            const updateData = {};
            if (key !== undefined)
                updateData.key = key;
            if (namespace !== undefined)
                updateData.namespace = namespace;
            if (translations !== undefined)
                updateData.translations = translations;
            updatedTranslation = yield Localization.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        }
        else {
            // namespace:key ile güncelleme - localizationService kullan
            const [currentNamespace, currentKey] = id.split(':');
            const result = yield localizationService_1.default.upsertTranslation({
                key: key || currentKey,
                namespace: namespace || currentNamespace,
                translations: translations || existingTranslation.translations
            });
            updatedTranslation = result;
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityId: id,
                    entityType: Entity_1.EntityType.LOCALIZATION,
                    action: History_1.ActionType.UPDATE,
                    userId: userId,
                    previousData: existingTranslation.toObject(),
                    newData: updatedTranslation === null || updatedTranslation === void 0 ? void 0 : updatedTranslation.toObject()
                });
                // İlişkili entity'lere history kaydı yap
                yield recordRelatedEntityHistory((updatedTranslation === null || updatedTranslation === void 0 ? void 0 : updatedTranslation.namespace) || existingTranslation.namespace, (updatedTranslation === null || updatedTranslation === void 0 ? void 0 : updatedTranslation.key) || existingTranslation.key, userId, true);
            }
            catch (historyError) {
                console.error('History creation failed for localization update:', historyError);
                // History hatası localization işlemini engellemesin
            }
        }
        res.status(200).json({
            success: true,
            data: updatedTranslation
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Çeviri güncellenirken bir hata oluştu'
        });
    }
});
exports.updateTranslationById = updateTranslationById;
// İlişkili entity'lere history kaydı yap
const recordRelatedEntityHistory = (namespace, key, userId, isUpdate) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        // Attribute ve AttributeGroup namespace'leri için ilişkili entity'leri bul
        if (namespace === 'attributes') {
            // Attribute veya AttributeGroup'lara ait name/description translation'ı olabilir
            const AttributeGroup = (yield Promise.resolve().then(() => __importStar(require('../models/AttributeGroup')))).default;
            const Attribute = (yield Promise.resolve().then(() => __importStar(require('../models/Attribute')))).default;
            // AttributeGroup'larda bu translation'ı kullananları bul
            const relatedAttributeGroups = yield AttributeGroup.find({
                $or: [
                    { 'name.key': key },
                    { 'description.key': key }
                ]
            }).populate('name description');
            for (const group of relatedAttributeGroups) {
                const isNameTranslation = ((_a = group.name) === null || _a === void 0 ? void 0 : _a.key) === key;
                const fieldName = isNameTranslation ? 'name' : 'description';
                yield historyService_1.default.recordHistory({
                    entityId: String(group._id),
                    entityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                    entityName: ((_c = (_b = group.name) === null || _b === void 0 ? void 0 : _b.translations) === null || _c === void 0 ? void 0 : _c.tr) || group.code || 'Unknown',
                    action: History_1.ActionType.UPDATE,
                    userId: userId,
                    additionalInfo: {
                        localizationChange: {
                            key,
                            namespace,
                            field: fieldName,
                            action: isUpdate ? 'updated' : 'created'
                        }
                    }
                });
            }
            // Attribute'larda bu translation'ı kullananları bul
            const relatedAttributes = yield Attribute.find({
                $or: [
                    { 'name.key': key },
                    { 'description.key': key }
                ]
            }).populate('name description');
            for (const attribute of relatedAttributes) {
                const isNameTranslation = ((_d = attribute.name) === null || _d === void 0 ? void 0 : _d.key) === key;
                const fieldName = isNameTranslation ? 'name' : 'description';
                yield historyService_1.default.recordHistory({
                    entityId: String(attribute._id),
                    entityType: Entity_1.EntityType.ATTRIBUTE,
                    entityName: ((_f = (_e = attribute.name) === null || _e === void 0 ? void 0 : _e.translations) === null || _f === void 0 ? void 0 : _f.tr) || attribute.code || 'Unknown',
                    action: History_1.ActionType.UPDATE,
                    userId: userId,
                    additionalInfo: {
                        localizationChange: {
                            key,
                            namespace,
                            field: fieldName,
                            action: isUpdate ? 'updated' : 'created'
                        }
                    }
                });
            }
        }
    }
    catch (error) {
        console.error('Error recording related entity history:', error);
    }
});
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
// Tüm çevirileri getir (liste sayfası için)
const getLocalizations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const namespace = req.query.namespace;
        const key = req.query.key;
        const translationValue = req.query.translationValue;
        const language = req.query.language;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = (req.query.sortOrder || 'desc');
        console.log('🔍 getLocalizations called with params:', {
            page,
            limit,
            search,
            namespace,
            key,
            translationValue,
            language,
            sortBy,
            sortOrder
        });
        console.log('🔍 Raw query params:', req.query);
        const result = yield localizationService_1.default.getLocalizations({
            page,
            limit,
            search,
            namespace,
            key,
            translationValue,
            language,
            sortBy,
            sortOrder
        });
        console.log('✅ getLocalizations result:', result);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        console.error('❌ getLocalizations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Çeviriler listesi getirilirken bir hata oluştu'
        });
    }
});
exports.getLocalizations = getLocalizations;
// Çeviri sil
const deleteLocalization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield localizationService_1.default.deleteLocalization(id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityId: id,
                    entityType: Entity_1.EntityType.LOCALIZATION,
                    action: History_1.ActionType.DELETE,
                    userId: userId,
                    previousData: result,
                    newData: null
                });
            }
            catch (historyError) {
                console.error('History creation failed for localization delete:', historyError);
            }
        }
        res.status(200).json({
            success: true,
            message: 'Çeviri başarıyla silindi',
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Çeviri silinirken bir hata oluştu'
        });
    }
});
exports.deleteLocalization = deleteLocalization;
