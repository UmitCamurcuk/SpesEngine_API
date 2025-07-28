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
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItems = exports.getItemsTest = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const mongoose_1 = __importDefault(require("mongoose"));
const ItemType_1 = __importDefault(require("../models/ItemType"));
const Category_1 = __importDefault(require("../models/Category"));
// GET tüm öğeleri getir (test için authentication olmadan)
const getItemsTest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            .populate({
            path: 'family',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'category',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('createdBy', 'name email firstName lastName')
            .populate('updatedBy', 'name email firstName lastName')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();
        // Translations alanlarını düzelt
        const fixTranslations = (obj) => {
            if (obj && typeof obj === 'object') {
                if (obj.translations && obj.translations instanceof Map) {
                    const translationsObj = {};
                    obj.translations.forEach((value, key) => {
                        translationsObj[key] = value;
                    });
                    obj.translations = translationsObj;
                }
            }
        };
        // Her item için translations alanlarını düzelt
        items.forEach((item) => {
            if (item.family) {
                if (item.family.name)
                    fixTranslations(item.family.name);
                if (item.family.description)
                    fixTranslations(item.family.description);
            }
            if (item.category) {
                if (item.category.name)
                    fixTranslations(item.category.name);
                if (item.category.description)
                    fixTranslations(item.category.description);
            }
        });
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
exports.getItemsTest = getItemsTest;
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
            .populate({
            path: 'family',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'category',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('createdBy', 'name email firstName lastName')
            .populate('updatedBy', 'name email firstName lastName')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();
        // Translations alanlarını düzelt
        const fixTranslations = (obj) => {
            if (obj && typeof obj === 'object') {
                if (obj.translations && obj.translations instanceof Map) {
                    const translationsObj = {};
                    obj.translations.forEach((value, key) => {
                        translationsObj[key] = value;
                    });
                    obj.translations = translationsObj;
                }
            }
        };
        // Her item için translations alanlarını düzelt
        items.forEach((item) => {
            if (item.family) {
                if (item.family.name)
                    fixTranslations(item.family.name);
                if (item.family.description)
                    fixTranslations(item.family.description);
            }
            if (item.category) {
                if (item.category.name)
                    fixTranslations(item.category.name);
                if (item.category.description)
                    fixTranslations(item.category.description);
            }
        });
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
// GET belirli bir öğeyi getir - Modern full hierarchy approach
const getItemById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Family = require('../models/Family').default;
        console.log('🔍 Fetching item with ID:', req.params.id);
        // 1. Temel item bilgilerini al
        const item = yield Item_1.default.findById(req.params.id)
            .populate({
            path: 'itemType',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                {
                    path: 'attributeGroups',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            select: 'name code type description isRequired isActive options',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'options',
                                    select: 'name code type description isActive',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
            .populate({
            path: 'category',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                { path: 'parent', select: 'name code description' },
                {
                    path: 'attributeGroups',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            select: 'name code type description isRequired isActive options',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'options',
                                    select: 'name code type description isActive',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
            .populate({
            path: 'family',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                { path: 'parent', select: 'name code description' },
                { path: 'category', select: 'name code description' },
                {
                    path: 'attributeGroups',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            select: 'name code type description isRequired isActive options',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'options',
                                    select: 'name code type description isActive',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
            .populate('createdBy', 'name email firstName lastName')
            .populate('updatedBy', 'name email firstName lastName')
            .lean();
        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Öğe bulunamadı'
            });
            return;
        }
        // 2. Category hierarchy'sini getir (parent categories)
        if (item.category && item.category._id) {
            const getCategoryHierarchy = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
                const hierarchy = [];
                let currentCategory = yield Category_1.default.findById(categoryId)
                    .populate({ path: 'name', select: 'key namespace translations' })
                    .populate({ path: 'description', select: 'key namespace translations' })
                    .populate({
                    path: 'attributeGroups',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            select: 'name code type description isRequired isActive options',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'options',
                                    select: 'name code type description isActive',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' }
                                    ]
                                }
                            ]
                        }
                    ]
                })
                    .populate('parent')
                    .lean();
                while (currentCategory) {
                    hierarchy.unshift(currentCategory); // Beginning'e ekle
                    if (currentCategory.parent) {
                        const parentId = typeof currentCategory.parent === 'string'
                            ? currentCategory.parent
                            : currentCategory.parent._id;
                        currentCategory = yield Category_1.default.findById(parentId)
                            .populate({ path: 'name', select: 'key namespace translations' })
                            .populate({ path: 'description', select: 'key namespace translations' })
                            .populate({
                            path: 'attributeGroups',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'attributes',
                                    select: 'name code type description isRequired isActive options',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' },
                                        {
                                            path: 'options',
                                            select: 'name code type description isActive',
                                            populate: [
                                                { path: 'name', select: 'key namespace translations' },
                                                { path: 'description', select: 'key namespace translations' }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        })
                            .populate('parent')
                            .lean();
                    }
                    else {
                        break;
                    }
                }
                return hierarchy;
            });
            const categoryHierarchy = yield getCategoryHierarchy(String(item.category._id));
            item.categoryHierarchy = categoryHierarchy;
        }
        // 3. Family hierarchy'sini getir (parent families)
        if (item.family && item.family._id) {
            const getFamilyHierarchy = (familyId) => __awaiter(void 0, void 0, void 0, function* () {
                const hierarchy = [];
                let currentFamily = yield Family.findById(familyId)
                    .populate({ path: 'name', select: 'key namespace translations' })
                    .populate({ path: 'description', select: 'key namespace translations' })
                    .populate({
                    path: 'attributeGroups',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            select: 'name code type description isRequired isActive options',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'options',
                                    select: 'name code type description isActive',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' }
                                    ]
                                }
                            ]
                        }
                    ]
                })
                    .populate('parent')
                    .lean();
                while (currentFamily) {
                    hierarchy.unshift(currentFamily); // Beginning'e ekle
                    if (currentFamily.parent) {
                        const parentId = typeof currentFamily.parent === 'string'
                            ? currentFamily.parent
                            : currentFamily.parent._id;
                        currentFamily = yield Family.findById(parentId)
                            .populate({ path: 'name', select: 'key namespace translations' })
                            .populate({ path: 'description', select: 'key namespace translations' })
                            .populate({
                            path: 'attributeGroups',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' },
                                {
                                    path: 'attributes',
                                    select: 'name code type description isRequired isActive options',
                                    populate: [
                                        { path: 'name', select: 'key namespace translations' },
                                        { path: 'description', select: 'key namespace translations' },
                                        {
                                            path: 'options',
                                            select: 'name code type description isActive',
                                            populate: [
                                                { path: 'name', select: 'key namespace translations' },
                                                { path: 'description', select: 'key namespace translations' }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        })
                            .populate('parent')
                            .lean();
                    }
                    else {
                        break;
                    }
                }
                return hierarchy;
            });
            const familyHierarchy = yield getFamilyHierarchy(String(item.family._id));
            item.familyHierarchy = familyHierarchy;
        }
        console.log('✅ Item fetched successfully with full hierarchy');
        res.status(200).json({
            success: true,
            data: item
        });
    }
    catch (error) {
        console.error('Item fetch error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Öğe getirilirken bir hata oluştu'
        });
    }
});
exports.getItemById = getItemById;
// Modern yardımcı fonksiyon: Full hierarchy'den zorunlu attribute'ları getir
function getRequiredAttributesFromHierarchy(itemTypeId, categoryId, familyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const Family = require('../models/Family').default;
        let requiredAttributes = [];
        // 1. ItemType'dan zorunlu attribute'ları al
        const itemTypeIdStr = typeof itemTypeId === 'string' ? itemTypeId : String(itemTypeId);
        console.log('🔍 Looking for itemType with ID:', itemTypeIdStr);
        const itemType = yield ItemType_1.default.findById(itemTypeIdStr).populate({
            path: 'attributeGroups',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' },
                {
                    path: 'attributes',
                    select: 'name code type description isRequired isActive',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' }
                    ]
                }
            ]
        });
        if (itemType && itemType.attributeGroups) {
            for (const group of itemType.attributeGroups) {
                if (group.attributes) {
                    requiredAttributes = requiredAttributes.concat(group.attributes.filter(attr => attr.isRequired));
                }
            }
        }
        // 2. Category hierarchy'sinden zorunlu attribute'ları al
        const getCategoryHierarchy = (catId) => __awaiter(this, void 0, void 0, function* () {
            // catId'nin string olduğundan emin ol
            const categoryId = typeof catId === 'string' ? catId : String(catId);
            console.log('🔍 Looking for category with ID:', categoryId);
            const category = yield Category_1.default.findById(categoryId).populate({
                path: 'attributeGroups',
                populate: [
                    { path: 'name', select: 'key namespace translations' },
                    { path: 'description', select: 'key namespace translations' },
                    {
                        path: 'attributes',
                        select: 'name code type description isRequired isActive',
                        populate: [
                            { path: 'name', select: 'key namespace translations' },
                            { path: 'description', select: 'key namespace translations' }
                        ]
                    }
                ]
            }).populate('parent');
            const hierarchy = [category];
            // Parent kategoriyi de ekle (recursive)
            if (category && category.parent) {
                let parentId;
                if (typeof category.parent === 'string') {
                    parentId = category.parent;
                }
                else if (category.parent && typeof category.parent === 'object' && category.parent._id) {
                    parentId = String(category.parent._id);
                }
                else {
                    parentId = String(category.parent);
                }
                console.log('🔍 Looking for parent category with ID:', parentId);
                const parentHierarchy = yield getCategoryHierarchy(parentId);
                hierarchy.push(...parentHierarchy);
            }
            return hierarchy.filter(cat => cat); // null/undefined'ları filtrele
        });
        if (categoryId) {
            const categoryHierarchy = yield getCategoryHierarchy(categoryId);
            for (const category of categoryHierarchy) {
                if (category.attributeGroups) {
                    for (const group of category.attributeGroups) {
                        if (group.attributes) {
                            requiredAttributes = requiredAttributes.concat(group.attributes.filter(attr => attr.isRequired));
                        }
                    }
                }
            }
        }
        // 3. Family hierarchy'sinden zorunlu attribute'ları al
        const getFamilyHierarchy = (famId) => __awaiter(this, void 0, void 0, function* () {
            // famId'nin string olduğundan emin ol
            const familyId = typeof famId === 'string' ? famId : String(famId);
            console.log('🔍 Looking for family with ID:', familyId);
            const family = yield Family.findById(familyId).populate({
                path: 'attributeGroups',
                populate: [
                    { path: 'name', select: 'key namespace translations' },
                    { path: 'description', select: 'key namespace translations' },
                    {
                        path: 'attributes',
                        select: 'name code type description isRequired isActive',
                        populate: [
                            { path: 'name', select: 'key namespace translations' },
                            { path: 'description', select: 'key namespace translations' }
                        ]
                    }
                ]
            }).populate('parent');
            const hierarchy = [family];
            // Parent family'i de ekle (recursive)
            if (family && family.parent) {
                let parentId;
                if (typeof family.parent === 'string') {
                    parentId = family.parent;
                }
                else if (family.parent && typeof family.parent === 'object' && family.parent._id) {
                    parentId = String(family.parent._id);
                }
                else {
                    parentId = String(family.parent);
                }
                console.log('🔍 Looking for parent family with ID:', parentId);
                const parentHierarchy = yield getFamilyHierarchy(parentId);
                hierarchy.push(...parentHierarchy);
            }
            return hierarchy.filter(fam => fam); // null/undefined'ları filtrele
        });
        if (familyId) {
            const familyHierarchy = yield getFamilyHierarchy(familyId);
            for (const family of familyHierarchy) {
                if (family.attributeGroups) {
                    for (const group of family.attributeGroups) {
                        if (group.attributes) {
                            requiredAttributes = requiredAttributes.concat(group.attributes.filter(attr => attr.isRequired));
                        }
                    }
                }
            }
        }
        // Duplicate'ları kaldır
        const uniq = (arr) => Array.from(new Map(arr.map(a => [a._id.toString(), a])).values());
        return uniq(requiredAttributes);
    });
}
// POST yeni öğe oluştur - Modern hierarchical approach
const createItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { itemType, family, category, attributes, isActive } = req.body;
        // Debug: Gelen payload'ı kontrol et
        console.log('🔍 Received payload:', {
            itemType,
            family,
            category,
            attributes,
            isActive
        });
        // Payload validation - ObjectId format kontrolü
        if (!itemType || !family || !category) {
            res.status(400).json({
                success: false,
                message: 'itemType, family ve category zorunludur'
            });
            return;
        }
        // String ID'leri kontrol et ve temizle
        const cleanItemType = typeof itemType === 'string' ? itemType : itemType._id || itemType;
        const cleanFamily = typeof family === 'string' ? family : family._id || family;
        const cleanCategory = typeof category === 'string' ? category : category._id || category;
        console.log('🔍 Cleaned IDs:', {
            itemType: cleanItemType,
            family: cleanFamily,
            category: cleanCategory
        });
        // Zorunlu attribute kontrolü - Full hierarchy (ItemType + Category + Family)
        const requiredAttributes = yield getRequiredAttributesFromHierarchy(cleanItemType, cleanCategory, cleanFamily);
        // Frontend'den gelen attributes objesini al (modern format)
        const itemAttributes = attributes || {};
        // Zorunlu attribute'lar için kontrol
        const missing = requiredAttributes.filter((attr) => {
            const value = itemAttributes[attr._id.toString()];
            return value == null || value === '' || value === undefined;
        });
        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Zorunlu öznitelikler eksik',
                missing: missing.map((a) => a.name)
            });
            return;
        }
        // Öğe oluştur
        const item = yield Item_1.default.create({
            itemType: cleanItemType,
            family: cleanFamily,
            category: cleanCategory,
            attributes: itemAttributes,
            isActive: isActive !== undefined ? isActive : true,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            updatedBy: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id
        });
        // Başarılı response
        res.status(201).json({
            success: true,
            data: item,
            message: 'Öğe başarıyla oluşturuldu'
        });
    }
    catch (error) {
        console.error('Item creation error:', error);
        if (error.code === 11000) {
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
    var _a;
    try {
        // Güncellenecek alanları al
        const updates = Object.assign(Object.assign({}, req.body), { updatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        // Zorunlu attribute kontrolü - Full hierarchy
        const requiredAttributes = yield getRequiredAttributesFromHierarchy(updates.itemType, updates.category, updates.family);
        const attrs = updates.attributes || {};
        const missing = requiredAttributes.filter((attr) => {
            const value = attrs[attr._id.toString()];
            return value == null || value === '' || value === undefined;
        });
        if (missing.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Zorunlu öznitelikler eksik',
                missing: missing.map((a) => a.name)
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
        const item = yield Item_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('itemType family category').populate('createdBy', 'name email firstName lastName').populate('updatedBy', 'name email firstName lastName');
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
