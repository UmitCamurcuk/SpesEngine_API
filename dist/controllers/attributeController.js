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
exports.updateAttributeGroups = exports.getAttributeGroups = exports.deleteAttribute = exports.updateAttribute = exports.createAttribute = exports.getAttributeById = exports.getAttributes = void 0;
const Attribute_1 = __importDefault(require("../models/Attribute"));
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
// GET tüm öznitelikleri getir
const getAttributes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Attributes fetch request received', req.query);
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const filterParams = {};
        // isActive parametresi özellikle belirtilmişse
        if (req.query.isActive !== undefined) {
            filterParams.isActive = req.query.isActive === 'true';
        }
        // Arama parametresi (name, code ve description alanlarında)
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filterParams.$or = [
                { name: searchRegex },
                { code: searchRegex },
                { description: searchRegex }
            ];
        }
        // Tip filtrelemesi
        if (req.query.type) {
            filterParams.type = req.query.type;
        }
        // Gerekli/Zorunlu filtrelemesi
        if (req.query.isRequired !== undefined) {
            filterParams.isRequired = req.query.isRequired === 'true';
        }
        // Öznitelik grubu filtrelemesi
        if (req.query.attributeGroup) {
            filterParams.attributeGroup = req.query.attributeGroup;
        }
        // Toplam kayıt sayısını al
        const total = yield Attribute_1.default.countDocuments(filterParams);
        // Sıralama parametreleri
        const sort = req.query.sort || 'name';
        const direction = req.query.direction === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sort] = direction;
        console.log('Sorting with:', { sort, direction, sortOptions });
        // Verileri getir
        const attributes = yield Attribute_1.default.find(filterParams)
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        // Sayfa sayısını hesapla
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            count: attributes.length,
            total,
            page,
            limit,
            pages,
            data: attributes
        });
    }
    catch (error) {
        console.error('Error fetching attributes:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Öznitelikler getirilirken bir hata oluştu'
        });
    }
});
exports.getAttributes = getAttributes;
// GET tek bir özniteliği getir
const getAttributeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const attribute = yield Attribute_1.default.findById(id)
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        if (!attribute) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: attribute
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öznitelik getirilirken bir hata oluştu'
        });
    }
});
exports.getAttributeById = getAttributeById;
// POST yeni öznitelik oluştur
const createAttribute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log('[AttributeController:DEBUG] Gelen veri:', JSON.stringify(req.body, null, 2));
        // AttributeGroup bilgisini ayır
        const _e = req.body, { attributeGroup } = _e, attributeData = __rest(_e, ["attributeGroup"]);
        // Validasyon verilerini kontrol et
        if (attributeData.validations) {
            console.log('[AttributeController:DEBUG] Validasyon içeriği:', JSON.stringify(attributeData.validations, null, 2));
            console.log('[AttributeController:DEBUG] Validasyon tipi:', typeof attributeData.validations);
            // Validasyon objesi boş ise undefined yap
            if (Object.keys(attributeData.validations).length === 0) {
                console.log('[AttributeController:DEBUG] Validasyon objesi boş, undefined yapılıyor');
                attributeData.validations = undefined;
            }
            else {
                // TCKNO gibi validasyon verilerinin sayısal değerlerini kontrol et
                if (attributeData.type === 'number' && typeof attributeData.validations === 'object') {
                    console.log('[AttributeController:DEBUG] Sayısal validasyonlar işleniyor...');
                    // min değeri için özel kontrol
                    if ('min' in attributeData.validations) {
                        const minVal = Number(attributeData.validations.min);
                        console.log(`[AttributeController:DEBUG] min değeri: ${attributeData.validations.min}, dönüştürülen: ${minVal}`);
                        attributeData.validations.min = minVal;
                    }
                    // max değeri için özel kontrol
                    if ('max' in attributeData.validations) {
                        const maxVal = Number(attributeData.validations.max);
                        console.log(`[AttributeController:DEBUG] max değeri: ${attributeData.validations.max}, dönüştürülen: ${maxVal}`);
                        attributeData.validations.max = maxVal;
                    }
                    // Boolean değerleri kontrol et
                    ['isInteger', 'isPositive', 'isNegative', 'isZero'].forEach(prop => {
                        if (prop in attributeData.validations) {
                            const boolVal = Boolean(attributeData.validations[prop]);
                            console.log(`[AttributeController:DEBUG] ${prop} değeri: ${attributeData.validations[prop]}, dönüştürülen: ${boolVal}`);
                            attributeData.validations[prop] = boolVal;
                        }
                    });
                }
                // Diğer tip validasyonları için de kontrol et
                if (attributeData.type === 'text' && typeof attributeData.validations === 'object') {
                    // Text validasyonları için özel kontroller
                    if ('minLength' in attributeData.validations) {
                        attributeData.validations.minLength = Number(attributeData.validations.minLength);
                    }
                    if ('maxLength' in attributeData.validations) {
                        attributeData.validations.maxLength = Number(attributeData.validations.maxLength);
                    }
                }
                // Tarih validasyonları için özel kontroller
                if (attributeData.type === 'date' && typeof attributeData.validations === 'object') {
                    // Tarih validasyonları için işlemler
                    // (minDate ve maxDate zaten string olarak geliyor)
                }
                // Select/MultiSelect validasyonları için özel kontroller
                if ((attributeData.type === 'select' || attributeData.type === 'multiselect') &&
                    typeof attributeData.validations === 'object') {
                    if ('minSelections' in attributeData.validations) {
                        attributeData.validations.minSelections = Number(attributeData.validations.minSelections);
                    }
                    if ('maxSelections' in attributeData.validations) {
                        attributeData.validations.maxSelections = Number(attributeData.validations.maxSelections);
                    }
                }
            }
        }
        else {
            console.log('[AttributeController:DEBUG] Validasyon verisi yok!');
        }
        console.log('[AttributeController:DEBUG] Attribute oluşturma öncesi son veri:', JSON.stringify(attributeData, null, 2));
        const newAttribute = yield Attribute_1.default.create(attributeData);
        // Oluşturulan attribute'u populate et
        const populatedAttribute = yield Attribute_1.default.findById(newAttribute._id)
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        // Kayıt sonrası doğrula
        console.log('[AttributeController:DEBUG] Oluşturulan kayıt:', JSON.stringify(populatedAttribute, null, 2));
        console.log('[AttributeController:DEBUG] Validasyon alanı kaydedildi mi:', (populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.validations) !== undefined);
        if (populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.validations) {
            console.log('[AttributeController:DEBUG] Kaydedilen validasyon:', JSON.stringify(populatedAttribute.validations, null, 2));
        }
        // AttributeGroup'a attribute'u ekle
        let affectedAttributeGroup = null;
        if (attributeGroup) {
            try {
                console.log(`[AttributeController:DEBUG] AttributeGroup'a ekleme işlemi başlıyor. Group ID: ${attributeGroup}, Attribute ID: ${newAttribute._id}`);
                const updatedGroup = yield AttributeGroup_1.default.findByIdAndUpdate(attributeGroup, { $addToSet: { attributes: newAttribute._id } }, { new: true }).populate('name', 'key namespace translations.tr translations.en');
                if (updatedGroup) {
                    affectedAttributeGroup = updatedGroup;
                    console.log(`[AttributeController:DEBUG] Attribute ${newAttribute._id} başarıyla AttributeGroup ${attributeGroup} içine eklendi`);
                    console.log(`[AttributeController:DEBUG] Güncellenmiş grup attributes listesi:`, updatedGroup.attributes);
                }
                else {
                    console.log(`[AttributeController:DEBUG] AttributeGroup ${attributeGroup} bulunamadı`);
                }
            }
            catch (groupError) {
                console.error('[AttributeController:DEBUG] AttributeGroup güncelleme hatası:', groupError);
                // AttributeGroup hatası attribute oluşturmayı engellemez
            }
        }
        else {
            console.log('[AttributeController:DEBUG] AttributeGroup seçilmemiş, ekleme işlemi yapılmıyor');
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            console.log(`[AttributeController:DEBUG] History kaydı oluşturuluyor, userId: ${userId}`);
            // Etkilenen entity'ler listesi
            const affectedEntities = [];
            if (affectedAttributeGroup) {
                affectedEntities.push({
                    entityId: affectedAttributeGroup._id,
                    entityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                    entityName: getEntityNameFromTranslation(affectedAttributeGroup.name),
                    role: 'secondary'
                });
            }
            yield historyService_1.default.recordHistory({
                entityId: String(newAttribute._id),
                entityType: Entity_1.EntityType.ATTRIBUTE,
                action: History_1.ActionType.CREATE,
                userId: userId,
                newData: {
                    name: ((_b = (_a = populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.name) === null || _a === void 0 ? void 0 : _a.translations) === null || _b === void 0 ? void 0 : _b.tr) || (populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.code) || 'Unknown',
                    code: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.code,
                    type: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.type,
                    description: ((_d = (_c = populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.description) === null || _c === void 0 ? void 0 : _c.translations) === null || _d === void 0 ? void 0 : _d.tr) || '',
                    isRequired: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.isRequired,
                    isActive: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.isActive,
                    options: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.options,
                    validations: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.validations,
                    _id: String(populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute._id),
                    createdAt: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.createdAt,
                    updatedAt: populatedAttribute === null || populatedAttribute === void 0 ? void 0 : populatedAttribute.updatedAt
                },
                affectedEntities
            });
        }
        res.status(201).json({
            success: true,
            data: populatedAttribute
        });
    }
    catch (error) {
        console.error('[AttributeController:DEBUG] Hata:', error.message);
        console.error('[AttributeController:DEBUG] Stack:', error.stack);
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik oluşturulurken bir hata oluştu'
        });
    }
});
exports.createAttribute = createAttribute;
// PUT özniteliği güncelle
const updateAttribute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const _e = req.body, { nameTranslations, descriptionTranslations } = _e, otherData = __rest(_e, ["nameTranslations", "descriptionTranslations"]);
        // Güncelleme öncesi mevcut veriyi al (geçmiş için)
        const previousAttribute = yield Attribute_1.default.findById(id)
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        if (!previousAttribute) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik bulunamadı'
            });
            return;
        }
        let updateData = Object.assign({}, otherData);
        const changedTranslations = [];
        // Name translations'ını güncelle
        if (nameTranslations && typeof nameTranslations === 'object') {
            const nameTranslationKey = (_a = previousAttribute.name) === null || _a === void 0 ? void 0 : _a.key;
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
                    oldValues: ((_b = previousAttribute.name) === null || _b === void 0 ? void 0 : _b.translations) || {},
                    newValues: nameTranslations
                });
            }
        }
        // Description translations'ını güncelle
        if (descriptionTranslations && typeof descriptionTranslations === 'object') {
            const descriptionTranslationKey = (_c = previousAttribute.description) === null || _c === void 0 ? void 0 : _c.key;
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
                    oldValues: ((_d = previousAttribute.description) === null || _d === void 0 ? void 0 : _d.translations) || {},
                    newValues: descriptionTranslations
                });
            }
        }
        // Güncelleme işlemi
        const updatedAttribute = yield Attribute_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            // Ana attribute güncelleme history'si
            const previousData = {
                name: previousAttribute.name,
                code: previousAttribute.code,
                type: previousAttribute.type,
                description: previousAttribute.description,
                isRequired: previousAttribute.isRequired,
                isActive: previousAttribute.isActive,
                options: previousAttribute.options
            };
            const newData = {
                name: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.name) || previousAttribute.name,
                code: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.code) || previousAttribute.code,
                type: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.type) || previousAttribute.type,
                description: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.description) || previousAttribute.description,
                isRequired: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.isRequired) !== undefined ? updatedAttribute.isRequired : previousAttribute.isRequired,
                isActive: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.isActive) !== undefined ? updatedAttribute.isActive : previousAttribute.isActive,
                options: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.options) || previousAttribute.options
            };
            yield historyService_1.default.recordHistory({
                entityId: id,
                entityType: Entity_1.EntityType.ATTRIBUTE,
                entityName: getEntityNameFromTranslation((updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.name) || previousAttribute.name),
                entityCode: (updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.code) || previousAttribute.code,
                action: History_1.ActionType.UPDATE,
                userId: userId,
                previousData,
                newData
            });
            // Translation değişiklikleri için ayrı history kayıtları
            for (const translationChange of changedTranslations) {
                // Translation değişiklikleri artık localizationController'da handle ediliyor
                console.log(`Translation change recorded for ${translationChange.field}: ${translationChange.translationKey}`);
            }
        }
        res.status(200).json({
            success: true,
            data: updatedAttribute
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik güncellenirken bir hata oluştu'
        });
    }
});
exports.updateAttribute = updateAttribute;
// DELETE özniteliği sil
const deleteAttribute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Silme öncesi veriyi al (geçmiş için)
        const attribute = yield Attribute_1.default.findById(id);
        if (!attribute) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik bulunamadı'
            });
            return;
        }
        // İlişkili AttributeGroup'ları bul
        const relatedGroups = yield AttributeGroup_1.default.find({ attributes: id })
            .populate('name', 'key namespace translations.tr translations.en');
        // Veriyi sil
        yield Attribute_1.default.findByIdAndDelete(id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            // Etkilenen AttributeGroup'lar
            const affectedEntities = relatedGroups.map(group => ({
                entityId: group._id,
                entityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                entityName: getEntityNameFromTranslation(group.name),
                role: 'secondary'
            }));
            yield historyService_1.default.recordHistory({
                entityId: id,
                entityType: Entity_1.EntityType.ATTRIBUTE,
                entityName: getEntityNameFromTranslation(attribute.name),
                entityCode: attribute.code,
                action: History_1.ActionType.DELETE,
                userId: userId,
                previousData: {
                    name: attribute.name,
                    code: attribute.code,
                    type: attribute.type,
                    description: attribute.description,
                    isRequired: attribute.isRequired,
                    isActive: attribute.isActive,
                    options: attribute.options
                },
                affectedEntities
            });
        }
        // Entity'nin tüm history kayıtlarını sil
        try {
            const deletedHistoryCount = yield historyService_1.default.deleteEntityHistory(id);
            console.log(`Deleted ${deletedHistoryCount} history records for attribute ${id}`);
        }
        catch (historyError) {
            console.error('Error deleting attribute history:', historyError);
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
            message: error.message || 'Öznitelik silinirken bir hata oluştu'
        });
    }
});
exports.deleteAttribute = deleteAttribute;
// GET özniteliğin bağlı olduğu grupları getir
const getAttributeGroups = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Attribute'ın var olup olmadığını kontrol et
        const attribute = yield Attribute_1.default.findById(id);
        if (!attribute) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik bulunamadı'
            });
            return;
        }
        // Bu attribute'ı içeren AttributeGroup'ları bul
        const attributeGroups = yield AttributeGroup_1.default.find({
            attributes: id,
            isActive: true
        })
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations.tr translations.en' },
                { path: 'description', select: 'key namespace translations.tr translations.en' }
            ]
        })
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        res.status(200).json({
            success: true,
            count: attributeGroups.length,
            data: attributeGroups
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
// PUT özniteliğin bağlı olduğu grupları güncelle
const updateAttributeGroups = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { attributeGroups } = req.body; // Yeni grup ID'leri dizisi
        // Attribute'ın var olup olmadığını kontrol et
        const attribute = yield Attribute_1.default.findById(id);
        if (!attribute) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik bulunamadı'
            });
            return;
        }
        // Önceki grupları bul
        const previousGroups = yield AttributeGroup_1.default.find({ attributes: id })
            .populate('name', 'key namespace translations.tr translations.en');
        // Önce bu attribute'ı tüm gruplardan kaldır
        yield AttributeGroup_1.default.updateMany({ attributes: id }, { $pull: { attributes: id } });
        // Sonra seçilen gruplara ekle
        let newGroups = [];
        if (attributeGroups && attributeGroups.length > 0) {
            yield AttributeGroup_1.default.updateMany({ _id: { $in: attributeGroups } }, { $addToSet: { attributes: id } });
            // Yeni grupları getir
            newGroups = yield AttributeGroup_1.default.find({ _id: { $in: attributeGroups } })
                .populate('name', 'key namespace translations.tr translations.en');
        }
        // Güncellenmiş grupları getir
        const updatedGroups = yield AttributeGroup_1.default.find({
            attributes: id,
            isActive: true
        })
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations.tr translations.en' },
                { path: 'description', select: 'key namespace translations.tr translations.en' }
            ]
        })
            .populate('name', 'key namespace translations.tr translations.en')
            .populate('description', 'key namespace translations.tr translations.en');
        // History kaydı oluştur - ilişki değişiklikleri için
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            // Kaldırılan gruplar için history
            for (const removedGroup of previousGroups) {
                if (!attributeGroups || !attributeGroups.includes(removedGroup._id.toString())) {
                    yield historyService_1.default.recordRelationshipChange({
                        primaryEntityId: id,
                        primaryEntityType: Entity_1.EntityType.ATTRIBUTE,
                        primaryEntityName: getEntityNameFromTranslation(attribute.name),
                        secondaryEntityId: removedGroup._id,
                        secondaryEntityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                        secondaryEntityName: getEntityNameFromTranslation(removedGroup.name),
                        action: 'remove',
                        relationshipType: 'attribute_group_membership',
                        userId
                    });
                }
            }
            // Eklenen gruplar için history
            for (const addedGroup of newGroups) {
                const wasAlreadyMember = previousGroups.some(pg => pg._id.toString() === addedGroup._id.toString());
                if (!wasAlreadyMember) {
                    yield historyService_1.default.recordRelationshipChange({
                        primaryEntityId: id,
                        primaryEntityType: Entity_1.EntityType.ATTRIBUTE,
                        primaryEntityName: getEntityNameFromTranslation(attribute.name),
                        secondaryEntityId: addedGroup._id,
                        secondaryEntityType: Entity_1.EntityType.ATTRIBUTE_GROUP,
                        secondaryEntityName: getEntityNameFromTranslation(addedGroup.name),
                        action: 'add',
                        relationshipType: 'attribute_group_membership',
                        userId
                    });
                }
            }
        }
        res.status(200).json({
            success: true,
            count: updatedGroups.length,
            data: updatedGroups
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik grupları güncellenirken bir hata oluştu'
        });
    }
});
exports.updateAttributeGroups = updateAttributeGroups;
