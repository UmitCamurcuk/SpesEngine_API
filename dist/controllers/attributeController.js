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
exports.deleteAttribute = exports.updateAttribute = exports.createAttribute = exports.getAttributeById = exports.getAttributes = void 0;
const Attribute_1 = __importDefault(require("../models/Attribute"));
const historyService_1 = __importDefault(require("../services/historyService"));
const History_1 = require("../models/History");
// GET tüm öznitelikleri getir
const getAttributes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Attributes fetch request received', req.query);
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const filterParams = { isActive: true };
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
            .populate('attributeGroup', 'name code')
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
            .populate('attributeGroup', 'name code description')
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
    try {
        console.log('[AttributeController:DEBUG] Gelen veri:', JSON.stringify(req.body, null, 2));
        // Validasyon verilerini kontrol et
        if (req.body.validations) {
            console.log('[AttributeController:DEBUG] Validasyon içeriği:', JSON.stringify(req.body.validations, null, 2));
            console.log('[AttributeController:DEBUG] Validasyon tipi:', typeof req.body.validations);
            // Validasyon objesi boş ise undefined yap
            if (Object.keys(req.body.validations).length === 0) {
                console.log('[AttributeController:DEBUG] Validasyon objesi boş, undefined yapılıyor');
                req.body.validations = undefined;
            }
            else {
                // TCKNO gibi validasyon verilerinin sayısal değerlerini kontrol et
                if (req.body.type === 'number' && typeof req.body.validations === 'object') {
                    console.log('[AttributeController:DEBUG] Sayısal validasyonlar işleniyor...');
                    // min değeri için özel kontrol
                    if ('min' in req.body.validations) {
                        const minVal = Number(req.body.validations.min);
                        console.log(`[AttributeController:DEBUG] min değeri: ${req.body.validations.min}, dönüştürülen: ${minVal}`);
                        req.body.validations.min = minVal;
                    }
                    // max değeri için özel kontrol
                    if ('max' in req.body.validations) {
                        const maxVal = Number(req.body.validations.max);
                        console.log(`[AttributeController:DEBUG] max değeri: ${req.body.validations.max}, dönüştürülen: ${maxVal}`);
                        req.body.validations.max = maxVal;
                    }
                    // Boolean değerleri kontrol et
                    ['isInteger', 'isPositive', 'isNegative', 'isZero'].forEach(prop => {
                        if (prop in req.body.validations) {
                            const boolVal = Boolean(req.body.validations[prop]);
                            console.log(`[AttributeController:DEBUG] ${prop} değeri: ${req.body.validations[prop]}, dönüştürülen: ${boolVal}`);
                            req.body.validations[prop] = boolVal;
                        }
                    });
                }
                // Diğer tip validasyonları için de kontrol et
                if (req.body.type === 'text' && typeof req.body.validations === 'object') {
                    // Text validasyonları için özel kontroller
                    if ('minLength' in req.body.validations) {
                        req.body.validations.minLength = Number(req.body.validations.minLength);
                    }
                    if ('maxLength' in req.body.validations) {
                        req.body.validations.maxLength = Number(req.body.validations.maxLength);
                    }
                }
                // Tarih validasyonları için özel kontroller
                if (req.body.type === 'date' && typeof req.body.validations === 'object') {
                    // Tarih validasyonları için işlemler
                    // (minDate ve maxDate zaten string olarak geliyor)
                }
                // Select/MultiSelect validasyonları için özel kontroller
                if ((req.body.type === 'select' || req.body.type === 'multiselect') &&
                    typeof req.body.validations === 'object') {
                    if ('minSelections' in req.body.validations) {
                        req.body.validations.minSelections = Number(req.body.validations.minSelections);
                    }
                    if ('maxSelections' in req.body.validations) {
                        req.body.validations.maxSelections = Number(req.body.validations.maxSelections);
                    }
                }
            }
        }
        else {
            console.log('[AttributeController:DEBUG] Validasyon verisi yok!');
        }
        console.log('[AttributeController:DEBUG] Attribute oluşturma öncesi son veri:', JSON.stringify(req.body, null, 2));
        const newAttribute = yield Attribute_1.default.create(req.body);
        // Kayıt sonrası doğrula
        console.log('[AttributeController:DEBUG] Oluşturulan kayıt:', JSON.stringify(newAttribute, null, 2));
        console.log('[AttributeController:DEBUG] Validasyon alanı kaydedildi mi:', newAttribute.validations !== undefined);
        if (newAttribute.validations) {
            console.log('[AttributeController:DEBUG] Kaydedilen validasyon:', JSON.stringify(newAttribute.validations, null, 2));
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            console.log(`[AttributeController:DEBUG] History kaydı oluşturuluyor, userId: ${userId}`);
            yield historyService_1.default.recordHistory({
                entityId: String(newAttribute._id),
                entityType: 'attribute',
                entityName: String(newAttribute.name),
                action: History_1.ActionType.CREATE,
                userId: userId,
                newData: newAttribute.toObject()
            });
        }
        res.status(201).json({
            success: true,
            data: newAttribute
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
    try {
        const { id } = req.params;
        // Güncelleme öncesi mevcut veriyi al (geçmiş için)
        const previousAttribute = yield Attribute_1.default.findById(id);
        if (!previousAttribute) {
            res.status(404).json({
                success: false,
                message: 'Öznitelik bulunamadı'
            });
            return;
        }
        // Güncelleme işlemi
        const updatedAttribute = yield Attribute_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            yield historyService_1.default.recordHistory({
                entityId: id,
                entityType: 'attribute',
                entityName: String((updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.name) || previousAttribute.name),
                action: History_1.ActionType.UPDATE,
                userId: userId,
                previousData: previousAttribute.toObject(),
                newData: updatedAttribute === null || updatedAttribute === void 0 ? void 0 : updatedAttribute.toObject()
            });
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
        // Veriyi sil
        yield Attribute_1.default.findByIdAndDelete(id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            yield historyService_1.default.recordHistory({
                entityId: id,
                entityType: 'attribute',
                entityName: String(attribute.name),
                action: History_1.ActionType.DELETE,
                userId: userId,
                previousData: attribute.toObject()
            });
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
