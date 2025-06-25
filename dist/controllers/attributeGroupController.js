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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttributeGroup = exports.updateAttributeGroup = exports.createAttributeGroup = exports.getAttributeGroupById = exports.getAttributeGroups = void 0;
const AttributeGroup_1 = __importDefault(require("../models/AttributeGroup"));
const historyService_1 = __importDefault(require("../services/historyService"));
const History_1 = require("../models/History");
const Entity_1 = require("../models/Entity");
// Translation object'inden metin çıkarmak için utility fonksiyon
const getEntityNameFromTranslation = (translationObject, fallback = 'Unknown') => {
    if (!translationObject)
        return fallback;
    // Eğer string ise direkt döndür
    if (typeof translationObject === 'string') {
        return translationObject;
    }
    // Translation object ise
    if (translationObject.translations) {
        // Önce Türkçe'yi dene
        if (translationObject.translations.tr) {
            return translationObject.translations.tr;
        }
        // Sonra İngilizce'yi dene
        if (translationObject.translations.en) {
            return translationObject.translations.en;
        }
        // Herhangi bir dili dene
        const firstTranslation = Object.values(translationObject.translations)[0];
        if (firstTranslation && typeof firstTranslation === 'string') {
            return firstTranslation;
        }
    }
    // Key varsa onu kullan
    if (translationObject.key) {
        return translationObject.key;
    }
    return fallback;
};
// GET tüm öznitelik gruplarını getir
const getAttributeGroups = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametrelerini alma
        const filterParams = {};
        // isActive parametresi
        if (req.query.isActive !== undefined) {
            filterParams.isActive = req.query.isActive === 'true';
        }
        // Search parametresi
        if (req.query.search && typeof req.query.search === 'string') {
            const searchTerm = req.query.search.trim();
            if (searchTerm) {
                filterParams.$or = [
                    { code: { $regex: searchTerm, $options: 'i' } }
                ];
            }
        }
        // includeAttributes parametresi - frontend'den gelen istek
        const includeAttributes = req.query.includeAttributes === 'true';
        let query = AttributeGroup_1.default.find(filterParams);
        if (includeAttributes) {
            query = query.populate({
                path: 'attributes',
                populate: [
                    { path: 'name', select: 'key namespace translations' },
                    { path: 'description', select: 'key namespace translations' }
                ]
            });
        }
        // Sorting
        const sortField = req.query.sort || 'updatedAt';
        const sortDirection = req.query.direction === 'asc' ? 1 : -1;
        const sortObj = {};
        sortObj[sortField] = sortDirection;
        // Get total count
        const total = yield AttributeGroup_1.default.countDocuments(filterParams);
        const attributeGroups = yield query
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: attributeGroups.length,
            total: total,
            page: page,
            limit: limit,
            attributeGroups: attributeGroups
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öznitelik grupları getirilirken bir hata oluştu'
        });
    }
});
exports.getAttributeGroups = getAttributeGroups;
// GET tek bir öznitelik grubunu getir
const getAttributeGroupById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attributeGroup = yield AttributeGroup_1.default.findById(req.params.id)
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        if (!attributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: attributeGroup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öznitelik grubu getirilirken bir hata oluştu'
        });
    }
});
exports.getAttributeGroupById = getAttributeGroupById;
// POST yeni öznitelik grubu oluştur
const createAttributeGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // createdBy field'ini ekle
        const createData = Object.assign(Object.assign({}, req.body), { createdBy: req.user && typeof req.user === 'object' && '_id' in req.user ? req.user._id : undefined });
        const attributeGroup = yield AttributeGroup_1.default.create(createData);
        // Oluşturulan attributeGroup'u populate et
        const populatedAttributeGroup = yield AttributeGroup_1.default.findById(attributeGroup._id)
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            // newData'yı düzgün formatla
            const historyData = {
                name: ((_b = (_a = populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.name) === null || _a === void 0 ? void 0 : _a.translations) === null || _b === void 0 ? void 0 : _b.tr) || (populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.code) || 'Unknown',
                code: populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.code,
                description: ((_d = (_c = populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.description) === null || _c === void 0 ? void 0 : _c.translations) === null || _d === void 0 ? void 0 : _d.tr) || '',
                attributes: (populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.attributes) || [],
                isActive: populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.isActive,
                _id: String(populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup._id),
                createdAt: populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.createdAt,
                updatedAt: populatedAttributeGroup === null || populatedAttributeGroup === void 0 ? void 0 : populatedAttributeGroup.updatedAt
            };
            yield historyService_1.default.recordHistory({
                entityId: String(attributeGroup._id),
                entityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                action: History_1.ActionType.CREATE,
                userId: userId,
                newData: historyData
            });
        }
        res.status(201).json({
            success: true,
            data: populatedAttributeGroup || attributeGroup
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik grubu oluşturulurken bir hata oluştu'
        });
    }
});
exports.createAttributeGroup = createAttributeGroup;
// PUT öznitelik grubunu güncelle
const updateAttributeGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const _e = req.body, { nameTranslations, descriptionTranslations } = _e, otherData = __rest(_e, ["nameTranslations", "descriptionTranslations"]);
        // Güncelleme öncesi mevcut veriyi al (geçmiş için)
        const previousAttributeGroup = yield AttributeGroup_1.default.findById(id)
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations');
        if (!previousAttributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        let updateData = Object.assign({}, otherData);
        const changedTranslations = [];
        // updatedBy field'ini ekle
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            updateData.updatedBy = req.user._id;
        }
        // Name translations'ını güncelle
        if (nameTranslations && typeof nameTranslations === 'object') {
            const nameTranslationKey = (_a = previousAttributeGroup.name) === null || _a === void 0 ? void 0 : _a.key;
            if (nameTranslationKey) {
                const localizationService = require('../services/localizationService').default;
                yield localizationService.upsertTranslation({
                    key: nameTranslationKey,
                    namespace: 'attributes',
                    translations: nameTranslations
                });
                changedTranslations.push({
                    field: 'name',
                    translationKey: nameTranslationKey,
                    oldValues: ((_b = previousAttributeGroup.name) === null || _b === void 0 ? void 0 : _b.translations) || {},
                    newValues: nameTranslations
                });
            }
        }
        // Description translations'ını güncelle
        if (descriptionTranslations && typeof descriptionTranslations === 'object') {
            const descriptionTranslationKey = (_c = previousAttributeGroup.description) === null || _c === void 0 ? void 0 : _c.key;
            if (descriptionTranslationKey) {
                const localizationService = require('../services/localizationService').default;
                yield localizationService.upsertTranslation({
                    key: descriptionTranslationKey,
                    namespace: 'attributes',
                    translations: descriptionTranslations
                });
                changedTranslations.push({
                    field: 'description',
                    translationKey: descriptionTranslationKey,
                    oldValues: ((_d = previousAttributeGroup.description) === null || _d === void 0 ? void 0 : _d.translations) || {},
                    newValues: descriptionTranslations
                });
            }
        }
        const attributeGroup = yield AttributeGroup_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations');
        if (!attributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            // Ana attributeGroup güncelleme history'si
            yield historyService_1.default.recordHistory({
                entityId: id,
                entityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                entityName: getEntityNameFromTranslation(attributeGroup.name || previousAttributeGroup.name),
                action: History_1.ActionType.UPDATE,
                userId: userId,
                previousData: previousAttributeGroup.toObject(),
                newData: attributeGroup.toObject(),
                comment: req.body.comment || undefined
            });
            // Translation değişiklikleri için ayrı history kayıtları
            for (const translationChange of changedTranslations) {
                // Translation değişikliği için ayrı history kaydı oluştur
                // await historyService.recordHistory({
                //   entityId: translationChange.translationKey,
                //   entityType: EntityType.TRANSLATION,
                //   entityName: `${translationChange.field}_translation`,
                //   action: ActionType.UPDATE,
                //   userId: userId,
                //   previousData: translationChange.oldValues,
                //   newData: translationChange.newValues,
                //   additionalInfo: {
                //     parentEntityId: id,
                //     parentEntityType: EntityType.ATTRIBUTE_GROUP,
                //     field: translationChange.field
                //   }
                // });
            }
        }
        res.status(200).json({
            success: true,
            data: attributeGroup
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik grubu güncellenirken bir hata oluştu'
        });
    }
});
exports.updateAttributeGroup = updateAttributeGroup;
// DELETE öznitelik grubunu sil
const deleteAttributeGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Silme öncesi veriyi al (geçmiş için)
        const attributeGroup = yield AttributeGroup_1.default.findById(req.params.id);
        if (!attributeGroup) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik grubu bulunamadı'
            });
            return;
        }
        // Veriyi sil
        yield AttributeGroup_1.default.findByIdAndDelete(req.params.id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            yield historyService_1.default.recordHistory({
                entityId: req.params.id,
                entityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                entityName: getEntityNameFromTranslation(attributeGroup.name),
                action: History_1.ActionType.DELETE,
                userId: userId,
                previousData: attributeGroup.toObject()
            });
        }
        // Entity'nin tüm history kayıtlarını sil
        try {
            const deletedHistoryCount = yield historyService_1.default.deleteEntityHistory(req.params.id);
            console.log(`Deleted ${deletedHistoryCount} history records for attribute group ${req.params.id}`);
        }
        catch (historyError) {
            console.error('Error deleting attribute group history:', historyError);
            // History silme hatası ana işlemi engellemesin
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik grubu silinirken bir hata oluştu'
        });
    }
});
exports.deleteAttributeGroup = deleteAttributeGroup;
