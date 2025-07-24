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
const notificationService_1 = __importDefault(require("../services/notificationService"));
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
        // Verileri getir
        const attributes = yield Attribute_1.default.find(filterParams)
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
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
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate({
            path: 'options',
            select: 'name code type',
            populate: {
                path: 'name',
                select: 'key namespace translations'
            }
        })
            .populate({
            path: 'optionType',
            select: 'name code type',
            populate: {
                path: 'name',
                select: 'key namespace translations'
            }
        });
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
        // AttributeGroup bilgisini ayır
        const _e = req.body, { attributeGroup, options, optionType } = _e, attributeData = __rest(_e, ["attributeGroup", "options", "optionType"]);
        // SELECT veya MULTISELECT için options kontrolü
        if (attributeData.type === 'select' || attributeData.type === 'multiselect') {
            // options dizisindeki her bir ID'nin geçerli bir attribute olduğunu kontrol et
            if (options && options.length > 0) {
                const optionAttributes = yield Attribute_1.default.find({
                    _id: { $in: options }
                });
                if (optionAttributes.length !== options.length) {
                    res.status(400).json({
                        success: false,
                        message: 'Bazı seçenekler bulunamadı'
                    });
                    return;
                }
                // optionType belirtilmişse, tüm seçeneklerin aynı tipte olmasını kontrol et
                if (optionType) {
                    const optionTypeAttribute = yield Attribute_1.default.findById(optionType);
                    if (!optionTypeAttribute) {
                        res.status(400).json({
                            success: false,
                            message: 'Geçersiz optionType'
                        });
                        return;
                    }
                    const wrongTypeOptions = optionAttributes.filter(attr => attr.type !== optionTypeAttribute.type);
                    if (wrongTypeOptions.length > 0) {
                        res.status(400).json({
                            success: false,
                            message: 'Bazı seçenekler optionType ile uyumlu değil'
                        });
                        return;
                    }
                    attributeData.optionType = optionType;
                }
                else {
                    // optionType belirtilmemişse, tüm seçeneklerin READONLY tipinde olmasını kontrol et
                    const nonReadonlyOptions = optionAttributes.filter(attr => attr.type !== 'readonly');
                    if (nonReadonlyOptions.length > 0) {
                        res.status(400).json({
                            success: false,
                            message: 'optionType belirtilmediği durumda tüm seçeneklerin READONLY tipinde olması gerekir'
                        });
                        return;
                    }
                }
                attributeData.options = options;
            }
            else {
                attributeData.options = [];
            }
        }
        // Validasyon verilerini kontrol et
        if (attributeData.validations) {
            // Validasyon objesi boş ise undefined yap
            if (Object.keys(attributeData.validations).length === 0) {
                attributeData.validations = undefined;
            }
            else {
                // TCKNO gibi validasyon verilerinin sayısal değerlerini kontrol et
                if (attributeData.type === 'number' && typeof attributeData.validations === 'object') {
                    // min değeri için özel kontrol
                    if ('min' in attributeData.validations) {
                        const minVal = Number(attributeData.validations.min);
                        attributeData.validations.min = minVal;
                    }
                    // max değeri için özel kontrol
                    if ('max' in attributeData.validations) {
                        const maxVal = Number(attributeData.validations.max);
                        attributeData.validations.max = maxVal;
                    }
                    // Boolean değerleri kontrol et
                    ['isInteger', 'isPositive', 'isNegative', 'isZero'].forEach(prop => {
                        if (prop in attributeData.validations) {
                            const boolVal = Boolean(attributeData.validations[prop]);
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
        }
        const newAttribute = yield Attribute_1.default.create(attributeData);
        // Oluşturulan attribute'u populate et
        const populatedAttribute = yield Attribute_1.default.findById(newAttribute._id)
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations');
        // Kayıt sonrası doğrula
        // AttributeGroup'a attribute'u ekle
        let affectedAttributeGroup = null;
        if (attributeGroup) {
            try {
                const updatedGroup = yield AttributeGroup_1.default.findByIdAndUpdate(attributeGroup, { $addToSet: { attributes: newAttribute._id } }, { new: true }).populate('name', 'key namespace translations');
                if (updatedGroup) {
                    affectedAttributeGroup = updatedGroup;
                }
                else {
                }
            }
            catch (groupError) {
                // AttributeGroup hatası attribute oluşturmayı engellemez
            }
        }
        else {
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
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
        res.status(400).json({
            success: false,
            message: error.message || 'Öznitelik oluşturulurken bir hata oluştu'
        });
    }
});
exports.createAttribute = createAttribute;
// PUT mevcut özniteliği güncelle
const updateAttribute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const _a = req.body, { options, comment, attributeGroups } = _a, updateData = __rest(_a, ["options", "comment", "attributeGroups"]);
        // Mevcut attribute'u bul
        const existingAttribute = yield Attribute_1.default.findById(id);
        if (!existingAttribute) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik bulunamadı'
            });
            return;
        }
        // Sadece değişen alanları tespit et
        const changedFields = {};
        // Basit alanları kontrol et
        Object.keys(updateData).forEach(key => {
            if (existingAttribute[key] !== updateData[key]) {
                changedFields[key] = updateData[key];
            }
        });
        // SELECT/MULTISELECT için options kontrolü
        if (options && (existingAttribute.type === 'select' || existingAttribute.type === 'multiselect')) {
            // Options ID'lerini kontrol et - hem string array hem de object array destekle
            let optionIds;
            if (Array.isArray(options)) {
                optionIds = options.map((opt) => {
                    // Eğer string ise direkt kullan, obje ise _id field'ını al
                    return typeof opt === 'string' ? opt : opt._id;
                }).filter(Boolean); // undefined/null değerleri filtrele
            }
            else {
                optionIds = [];
            }
            // Mevcut options ile karşılaştır
            const currentOptionIds = (existingAttribute.options || []).map(opt => opt.toString()).sort();
            const newOptionIds = optionIds.sort();
            if (JSON.stringify(currentOptionIds) !== JSON.stringify(newOptionIds)) {
                if (optionIds.length > 0) {
                    const foundOptions = yield Attribute_1.default.find({
                        _id: { $in: optionIds },
                        type: 'readonly'
                    });
                    if (foundOptions.length !== optionIds.length) {
                        res.status(400).json({
                            success: false,
                            message: 'Bazı seçenekler bulunamadı veya yanlış tipte'
                        });
                        return;
                    }
                }
                changedFields.options = optionIds;
            }
        }
        // Attribute Groups kontrolü
        if (attributeGroups && Array.isArray(attributeGroups)) {
            // Mevcut grupları al
            const currentGroups = yield AttributeGroup_1.default.find({ attributes: id }).select('_id');
            const currentGroupIds = currentGroups.map(g => String(g._id)).sort();
            const newGroupIds = [...attributeGroups].sort();
            if (JSON.stringify(currentGroupIds) !== JSON.stringify(newGroupIds)) {
                changedFields.attributeGroups = attributeGroups;
            }
        }
        // Eğer hiçbir alan değişmemişse güncelleme yapma
        if (Object.keys(changedFields).length === 0 && !changedFields.attributeGroups) {
            res.status(200).json({
                success: true,
                message: 'Değişiklik bulunamadı',
                data: existingAttribute
            });
            return;
        }
        // Attribute'u güncelle
        const updatedAttribute = yield Attribute_1.default.findByIdAndUpdate(id, changedFields, { new: true }).populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate({
            path: 'options',
            select: 'name code type',
            populate: {
                path: 'name',
                select: 'key namespace translations'
            }
        });
        // Attribute Groups güncelleme
        if (changedFields.attributeGroups) {
            // Önce tüm gruplardan bu attribute'ı kaldır
            yield AttributeGroup_1.default.updateMany({ attributes: id }, { $pull: { attributes: id } });
            // Sonra yeni gruplara ekle
            if (attributeGroups.length > 0) {
                yield AttributeGroup_1.default.updateMany({ _id: { $in: attributeGroups } }, { $addToSet: { attributes: id } });
            }
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            yield historyService_1.default.recordHistory({
                entityType: Entity_1.EntityType.ATTRIBUTE,
                entityId: id,
                action: History_1.ActionType.UPDATE,
                changes: changedFields, // Sadece değişen alanları kaydet
                comment: comment || undefined,
                userId,
                entityName: getEntityNameFromTranslation(existingAttribute.name),
                entityCode: existingAttribute.code
            });
        }
        res.status(200).json({
            success: true,
            data: updatedAttribute
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öznitelik güncellenirken bir hata oluştu'
        });
    }
});
exports.updateAttribute = updateAttribute;
// DELETE özniteliği sil
const deleteAttribute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
            .populate('name', 'key namespace translations');
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
            // Bildirim sistemi - onDelete true ise bildirim gönder
            if ((_a = attribute.notificationSettings) === null || _a === void 0 ? void 0 : _a.onDelete) {
                try {
                    const userName = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.username) || 'Bilinmeyen Kullanıcı';
                    yield notificationService_1.default.sendEntityDeleteNotification('attribute', id, getEntityNameFromTranslation(attribute.name), userId, userName);
                }
                catch (notificationError) {
                    console.error('Notification error:', notificationError);
                    // Bildirim hatası ana işlemi engellemez
                }
            }
        }
        // Entity'nin tüm history kayıtlarını sil
        try {
            const deletedHistoryCount = yield historyService_1.default.deleteEntityHistory(id);
        }
        catch (historyError) {
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
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations');
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
            .populate('name', 'key namespace translations');
        // Önce bu attribute'ı tüm gruplardan kaldır
        yield AttributeGroup_1.default.updateMany({ attributes: id }, { $pull: { attributes: id } });
        // Sonra seçilen gruplara ekle
        let newGroups = [];
        if (attributeGroups && attributeGroups.length > 0) {
            yield AttributeGroup_1.default.updateMany({ _id: { $in: attributeGroups } }, { $addToSet: { attributes: id } });
            // Yeni grupları getir
            newGroups = yield AttributeGroup_1.default.find({ _id: { $in: attributeGroups } })
                .populate('name', 'key namespace translations');
        }
        // Güncellenmiş grupları getir
        const updatedGroups = yield AttributeGroup_1.default.find({
            attributes: id,
            isActive: true
        })
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations');
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
