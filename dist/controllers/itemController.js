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
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItems = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const mongoose_1 = __importDefault(require("mongoose"));
const ItemType_1 = __importDefault(require("../models/ItemType"));
const Category_1 = __importDefault(require("../models/Category"));
// GET tüm öğeleri getir
const getItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const filterParams = {};
        // isActive parametresi
        if (req.query.isActive !== undefined) {
            filterParams.isActive = req.query.isActive === 'true';
        }
        // Arama parametresi artık attributes'larda aranabilir
        // TODO: Attributes içinde arama yapılacaksa burada implement edilebilir
        // ItemType, Family ve Category filtreleme
        if (req.query.itemType) {
            filterParams.itemType = new mongoose_1.default.Types.ObjectId(req.query.itemType);
        }
        if (req.query.family) {
            filterParams.family = new mongoose_1.default.Types.ObjectId(req.query.family);
        }
        if (req.query.category) {
            filterParams.category = new mongoose_1.default.Types.ObjectId(req.query.category);
        }
        // Sıralama parametreleri
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;
        // Toplam kayıt sayısını al
        const total = yield Item_1.default.countDocuments(filterParams);
        // Verileri getir
        const items = yield Item_1.default.find(filterParams)
            .populate('itemType')
            .populate('family')
            .populate('category')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        // Sayfa sayısını hesapla
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            count: items.length,
            total,
            page,
            pages,
            data: items
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öğeler getirilirken bir hata oluştu'
        });
    }
});
exports.getItems = getItems;
// GET belirli bir öğeyi getir
const getItemById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield Item_1.default.findById(req.params.id)
            .populate('itemType')
            .populate('family')
            .populate('category');
        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Öğe bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: item
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe getirilirken bir hata oluştu'
        });
    }
});
exports.getItemById = getItemById;
// Yardımcı fonksiyon: itemType ve category'den zorunlu attribute'ları getir
function getRequiredAttributes(itemTypeId, categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        const itemType = yield ItemType_1.default.findById(itemTypeId).populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        });
        let requiredAttributes = [];
        if (itemType && itemType.attributes) {
            requiredAttributes = requiredAttributes.concat(itemType.attributes.filter(attr => attr.isRequired));
        }
        if (categoryId) {
            const category = yield Category_1.default.findById(categoryId).populate({
                path: 'attributeGroups',
                populate: [
                    { path: 'name', select: 'key namespace translations' },
                    { path: 'description', select: 'key namespace translations' },
                    {
                        path: 'attributes',
                        populate: [
                            { path: 'name', select: 'key namespace translations' },
                            { path: 'description', select: 'key namespace translations' }
                        ]
                    }
                ]
            });
            if (category && category.attributeGroups && category.attributeGroups.length > 0) {
                // Her bir attributeGroup için
                for (const group of category.attributeGroups) {
                    if (group.attributes) {
                        requiredAttributes = requiredAttributes.concat(group.attributes.filter(attr => attr.isRequired));
                    }
                }
            }
        }
        // Aynı attribute birden fazla gelirse uniq yap
        const uniq = (arr) => Array.from(new Map(arr.map(a => [a._id.toString(), a])).values());
        return uniq(requiredAttributes);
    });
}
// POST yeni öğe oluştur
const createItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemType, family, category, attributeValues, isActive } = req.body;
        // Zorunlu attribute kontrolü
        const requiredAttributes = yield getRequiredAttributes(itemType, category);
        // AttributeValues array'i varsa bir nesneye çevirelim
        let attributes = {};
        if (attributeValues && Array.isArray(attributeValues)) {
            attributeValues.forEach(attr => {
                if (attr.attributeId && attr.value !== undefined) {
                    attributes[attr.attributeId] = attr.value;
                }
            });
        }
        // Zorunlu attributelar için kontrol
        const missing = requiredAttributes.filter(attr => !attributes || attributes[attr._id.toString()] == null || attributes[attr._id.toString()] === '');
        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Zorunlu öznitelikler eksik',
                missing: missing.map(a => a.name)
            });
            return;
        }
        // Öğe oluştur
        const item = yield Item_1.default.create({
            itemType,
            family,
            category,
            attributes: attributes,
            isActive: isActive !== undefined ? isActive : true
        });
        res.status(201).json({
            success: true,
            data: item
        });
    }
    catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            res.status(400).json({
                success: false,
                message: 'Tekrarlayan veri hatası'
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe oluşturulurken bir hata oluştu'
        });
    }
});
exports.createItem = createItem;
// PUT öğeyi güncelle
const updateItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Güncellenecek alanları al
        const updates = Object.assign({}, req.body);
        // Zorunlu attribute kontrolü
        const requiredAttributes = yield getRequiredAttributes(updates.itemType, updates.category);
        const attrs = updates.attributes || {};
        const missing = requiredAttributes.filter(attr => !attrs || attrs[attr._id.toString()] == null || attrs[attr._id.toString()] === '');
        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Zorunlu öznitelikler eksik',
                missing: missing.map(a => a.name)
            });
            return;
        }
        // Attributes kontrolü
        if (updates.attributes && typeof updates.attributes === 'object') {
            // Attributes alanı zaten bir nesne, işleme gerek yok
        }
        else if (updates.attributes !== undefined) {
            // Geçersiz bir attributes değeri, boş bir nesne ile değiştir
            updates.attributes = {};
        }
        // Öğeyi bul ve güncelle
        const item = yield Item_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('itemType family category');
        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Güncellenmek istenen öğe bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: item
        });
    }
    catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            res.status(400).json({
                success: false,
                message: 'Tekrarlayan veri hatası'
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe güncellenirken bir hata oluştu'
        });
    }
});
exports.updateItem = updateItem;
// DELETE öğeyi sil
const deleteItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield Item_1.default.findByIdAndDelete(req.params.id);
        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Silinmek istenen öğe bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Öğe başarıyla silindi',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe silinirken bir hata oluştu'
        });
    }
});
exports.deleteItem = deleteItem;
