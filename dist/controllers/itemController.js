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
exports.createRuleBasedAssociation = exports.getItemAssociationMetadata = exports.getFilteredItemsByRule = exports.getItemAssociationRules = exports.validateItemAssociations = exports.getItemTypeAssociationRules = exports.searchItemsForAssociation = exports.removeAssociation = exports.createAssociation = exports.getItemAssociations = exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItemsByType = exports.getItems = exports.getItemsTest = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const mongoose_1 = __importDefault(require("mongoose"));
const ItemType_1 = __importDefault(require("../models/ItemType"));
const Category_1 = __importDefault(require("../models/Category"));
const Attribute_1 = __importDefault(require("../models/Attribute"));
const associationService_1 = __importDefault(require("../services/associationService"));
const enhancedAssociationService_1 = __importDefault(require("../services/enhancedAssociationService"));
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
        // Her item için translations alanlarını düzelt ve attribute'ları populate et
        for (const item of items) {
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
            // Attribute'ları populate et
            if (item.attributes && typeof item.attributes === 'object') {
                item.attributes = yield populateAttributeValues(item.attributes);
            }
        }
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
        // Her item için translations alanlarını düzelt ve attribute'ları populate et
        for (const item of items) {
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
            // Attribute'ları populate et
            if (item.attributes && typeof item.attributes === 'object') {
                item.attributes = yield populateAttributeValues(item.attributes);
            }
        }
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
// GET belirli ItemType'a ait öğeleri getir - Enhanced for Association Display
const getItemsByType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemTypeCode } = req.params;
        // ItemType'ı bul ve attribute definitions'ları al
        const itemType = yield ItemType_1.default.findOne({ code: itemTypeCode })
            .populate({
            path: 'attributeGroups',
            populate: {
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
        })
            .lean();
        if (!itemType) {
            res.status(404).json({
                success: false,
                message: `${itemTypeCode} kodlu öğe tipi bulunamadı`
            });
            return;
        }
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100; // Association için daha yüksek default
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const filterParams = {
            itemType: itemType._id,
            isActive: true // Association items genelde aktif olanlar
        };
        // Additional filters from query params
        if (req.query.isActive !== undefined) {
            filterParams.isActive = req.query.isActive === 'true';
        }
        if (req.query.family) {
            filterParams.family = new mongoose_1.default.Types.ObjectId(req.query.family);
        }
        if (req.query.category) {
            filterParams.category = new mongoose_1.default.Types.ObjectId(req.query.category);
        }
        // Apply custom filters passed in the request body
        if (req.body && typeof req.body === 'object') {
            Object.keys(req.body).forEach(key => {
                filterParams[key] = req.body[key];
            });
        }
        // Sıralama parametreleri
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;
        // Toplam kayıt sayısını al
        const total = yield Item_1.default.countDocuments(filterParams);
        // Verileri getir - Association için sadece gerekli alanları populate et
        const items = yield Item_1.default.find(filterParams)
            .populate({
            path: 'family',
            select: 'name code',
            populate: {
                path: 'name',
                select: 'key namespace translations'
            }
        })
            .populate({
            path: 'category',
            select: 'name code',
            populate: {
                path: 'name',
                select: 'key namespace translations'
            }
        })
            .select('_id attributes isActive createdAt updatedAt family category') // Sadece gerekli alanlar
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
        // Attribute definitions'ları topla
        const attributeDefinitions = {};
        if (itemType.attributeGroups) {
            itemType.attributeGroups.forEach((group) => {
                if (group.attributes) {
                    group.attributes.forEach((attr) => {
                        attributeDefinitions[attr._id] = Object.assign(Object.assign({}, attr), { groupName: group.name });
                    });
                }
            });
        }
        // Her item için translations alanlarını düzelt ve attributes'ları parse et
        for (const item of items) {
            if (item.family && item.family.name) {
                fixTranslations(item.family.name);
            }
            if (item.category && item.category.name) {
                fixTranslations(item.category.name);
            }
            // Attributes'ları parse et ve anlamlı hale getir
            if (item.attributes && typeof item.attributes === 'object') {
                const parsedAttributes = {};
                Object.keys(item.attributes).forEach(attrId => {
                    const attrDef = attributeDefinitions[attrId];
                    const attrValue = item.attributes[attrId];
                    if (attrDef) {
                        let displayValue = attrValue;
                        // Select type için option name'ini bul
                        if (attrDef.type === 'select' && attrDef.options && Array.isArray(attrValue)) {
                            const selectedOption = attrDef.options.find((opt) => opt._id === attrValue);
                            displayValue = selectedOption ? selectedOption.name : attrValue;
                        }
                        // Table type için formatla
                        if (attrDef.type === 'table' && Array.isArray(attrValue)) {
                            displayValue = attrValue.map((row) => row.join(' x ')).join(', ');
                        }
                        // Date type için formatla
                        if (attrDef.type === 'date' && attrValue) {
                            displayValue = new Date(attrValue).toLocaleDateString('tr-TR');
                        }
                        parsedAttributes[attrId] = {
                            value: attrValue,
                            displayValue: displayValue,
                            definition: {
                                name: attrDef.name,
                                code: attrDef.code,
                                type: attrDef.type,
                                groupName: attrDef.groupName
                            }
                        };
                    }
                    else {
                        // Definition bulunamadıysa raw value'yu kullan
                        parsedAttributes[attrId] = {
                            value: attrValue,
                            displayValue: attrValue,
                            definition: null
                        };
                    }
                });
                item.attributes = parsedAttributes;
            }
        }
        // Sayfa sayısını hesapla
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            count: items.length,
            total,
            page,
            pages,
            data: items,
            // Association display için ek bilgiler
            meta: {
                itemType: {
                    code: itemType.code,
                    name: itemType.name,
                    attributeDefinitions: Object.keys(attributeDefinitions).length
                }
            }
        });
    }
    catch (error) {
        console.error(`${req.params.itemTypeCode} tipindeki öğeler getirilirken hata:`, error);
        res.status(500).json({
            success: false,
            message: error.message || 'Öğeler getirilirken bir hata oluştu'
        });
    }
});
exports.getItemsByType = getItemsByType;
// GET belirli bir öğeyi getir - Modern full hierarchy approach
const getItemById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Family = require('../models/Family').default;
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
        // 4. Association'ları getir ve populate et
        try {
            const associations = yield associationService_1.default.getItemAssociations(item._id.toString(), {
                populate: true,
                populateFields: ['itemType', 'family', 'category'],
                includeInactive: false
            });
            item.populatedAssociations = associations;
        }
        catch (associationError) {
            console.warn('Association fetch error:', associationError);
            item.populatedAssociations = [];
        }
        console.log('✅ Item fetched successfully with full hierarchy and associations');
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
// Attribute değerlerini populate eden yardımcı fonksiyon
function populateAttributeValues(attributes) {
    return __awaiter(this, void 0, void 0, function* () {
        const populatedAttributes = [];
        for (const [attributeId, value] of Object.entries(attributes)) {
            try {
                // Attribute'u bul
                const attribute = yield Attribute_1.default.findById(attributeId)
                    .populate({
                    path: 'name',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'description',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'options',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' }
                    ]
                })
                    .lean();
                if (attribute) {
                    // Temel attribute bilgilerini ekle
                    const populatedAttribute = {
                        _id: attribute._id,
                        code: attribute.code,
                        type: attribute.type,
                        name: attribute.name,
                        description: attribute.description,
                        isRequired: attribute.isRequired,
                        options: attribute.options,
                        validations: attribute.validations,
                        notificationSettings: attribute.notificationSettings,
                        isActive: attribute.isActive,
                        createdAt: attribute.createdAt,
                        updatedAt: attribute.updatedAt,
                        __v: attribute.__v,
                        value: value
                    };
                    // Eğer değer başka bir attribute'un ID'si ise, referencedValue ekle
                    if (typeof value === 'string' && value.length === 24) {
                        try {
                            const referencedAttribute = yield Attribute_1.default.findById(value)
                                .populate({
                                path: 'name',
                                select: 'key namespace translations'
                            })
                                .populate({
                                path: 'description',
                                select: 'key namespace translations'
                            })
                                .lean();
                            if (referencedAttribute) {
                                populatedAttribute.referencedValue = referencedAttribute;
                            }
                        }
                        catch (refError) {
                            console.log('Referenced attribute not found:', value);
                        }
                    }
                    populatedAttributes.push(populatedAttribute);
                }
                else {
                    // Attribute bulunamadıysa sadece değeri ekle
                    populatedAttributes.push({
                        _id: attributeId,
                        value: value,
                        error: 'Attribute not found'
                    });
                }
            }
            catch (error) {
                console.error('Error populating attribute:', attributeId, error);
                // Hata durumunda sadece değeri ekle
                populatedAttributes.push({
                    _id: attributeId,
                    value: value,
                    error: 'Population error'
                });
            }
        }
        return populatedAttributes;
    });
}
// Modern yardımcı fonksiyon: Full hierarchy'den zorunlu attribute'ları getir
function getRequiredAttributesFromHierarchy(itemTypeId, categoryId, familyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const Family = require('../models/Family').default;
        let requiredAttributes = [];
        // 1. ItemType'dan zorunlu attribute'ları al
        const itemTypeIdStr = typeof itemTypeId === 'string' ? itemTypeId : String(itemTypeId);
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
// POST yeni öğe oluştur - Modern hierarchical approach with associations
const createItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { itemType, family, category, attributes, associations, isActive } = req.body;
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
            associations: associations || {},
            isActive: isActive !== undefined ? isActive : true,
            createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            updatedBy: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id
        });
        // Association validation (oluşturulduktan sonra)
        if (associations && Object.keys(associations).length > 0) {
            try {
                const validationResult = yield associationService_1.default.validateAssociations(String(item._id), associations);
                if (!validationResult.isValid) {
                    // Item'ı sil çünkü association'lar geçersiz
                    yield Item_1.default.findByIdAndDelete(String(item._id));
                    res.status(400).json({
                        success: false,
                        message: 'Association validation başarısız',
                        errors: validationResult.errors,
                        warnings: validationResult.warnings
                    });
                    return;
                }
            }
            catch (validationError) {
                // Item'ı sil çünkü validation hatası
                yield Item_1.default.findByIdAndDelete(String(item._id));
                res.status(400).json({
                    success: false,
                    message: 'Association validation hatası',
                    error: validationError.message
                });
                return;
            }
        }
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
// ============================================================================
// ASSOCIATION MANAGEMENT ENDPOINTS
// ============================================================================
// GET item'ın association'larını getir
const getItemAssociations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { populate = 'true', includeInactive = 'false' } = req.query;
        const associations = yield associationService_1.default.getItemAssociations(id, {
            populate: populate === 'true',
            populateFields: ['itemType', 'family', 'category'],
            includeInactive: includeInactive === 'true'
        });
        res.status(200).json({
            success: true,
            data: associations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Association\'lar getirilirken hata oluştu'
        });
    }
});
exports.getItemAssociations = getItemAssociations;
// POST yeni association oluştur
const createAssociation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceItemId } = req.params;
        const { targetItemId, associationType } = req.body;
        if (!targetItemId || !associationType) {
            res.status(400).json({
                success: false,
                message: 'targetItemId ve associationType gerekli'
            });
            return;
        }
        yield associationService_1.default.createAssociation(sourceItemId, targetItemId, associationType);
        res.status(201).json({
            success: true,
            message: 'Association başarıyla oluşturuldu'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Association oluşturulurken hata oluştu'
        });
    }
});
exports.createAssociation = createAssociation;
// DELETE association sil
const removeAssociation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceItemId } = req.params;
        const { targetItemId, associationType } = req.body;
        if (!targetItemId || !associationType) {
            res.status(400).json({
                success: false,
                message: 'targetItemId ve associationType gerekli'
            });
            return;
        }
        yield associationService_1.default.removeAssociation(sourceItemId, targetItemId, associationType);
        res.status(200).json({
            success: true,
            message: 'Association başarıyla silindi'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Association silinirken hata oluştu'
        });
    }
});
exports.removeAssociation = removeAssociation;
// GET association için uygun item'ları ara
const searchItemsForAssociation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sourceItemId, targetItemTypeCode } = req.params;
        const { search, page = '1', limit = '20', includeInactive = 'false' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const items = yield associationService_1.default.searchItemsForAssociation(sourceItemId, targetItemTypeCode, search, {
            populate: true,
            populateFields: ['itemType', 'family', 'category'],
            includeInactive: includeInactive === 'true',
            skip,
            limit: limitNum,
            sort: { createdAt: -1 }
        });
        res.status(200).json({
            success: true,
            data: items,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: items.length
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Item arama işleminde hata oluştu'
        });
    }
});
exports.searchItemsForAssociation = searchItemsForAssociation;
// GET ItemType'ın association rules'ları
const getItemTypeAssociationRules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemTypeCode } = req.params;
        const rules = yield associationService_1.default.getAssociationRules(itemTypeCode);
        res.status(200).json({
            success: true,
            data: rules
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Association rules getirilirken hata oluştu'
        });
    }
});
exports.getItemTypeAssociationRules = getItemTypeAssociationRules;
// POST association validation
const validateItemAssociations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { associations } = req.body;
        if (!associations) {
            res.status(400).json({
                success: false,
                message: 'associations verisi gerekli'
            });
            return;
        }
        const validationResult = yield associationService_1.default.validateAssociations(id, associations);
        res.status(200).json({
            success: true,
            data: validationResult
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Association validation işleminde hata oluştu'
        });
    }
});
exports.validateItemAssociations = validateItemAssociations;
// GET item'ın enhanced association rules'ları
const getItemAssociationRules = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { includeInactive = false } = req.query;
        // Item'ı getir ve itemType'ını bul
        const item = yield Item_1.default.findById(id).populate('itemType');
        if (!item) {
            res.status(404).json({
                success: false,
                message: 'Item bulunamadı'
            });
            return;
        }
        const itemType = item.itemType;
        const rules = yield enhancedAssociationService_1.default.getAssociationRules(itemType.code, includeInactive === 'true');
        res.status(200).json({
            success: true,
            data: rules
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Association rules getirilirken hata oluştu'
        });
    }
});
exports.getItemAssociationRules = getItemAssociationRules;
// GET kural tabanlı filtrelenmiş item'lar
const getFilteredItemsByRule = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, ruleCode } = req.params;
        const { page = 1, limit = 10, searchQuery, additionalFilters, populate = true } = req.query;
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Options
        const options = {
            skip,
            limit: limitNum,
            searchQuery: searchQuery,
            additionalFilters: additionalFilters ? JSON.parse(additionalFilters) : undefined,
            populate: populate === 'true'
        };
        const items = yield enhancedAssociationService_1.default.getFilteredItems(id, ruleCode, options);
        // Total count için ayrı sorgu
        const totalItems = yield enhancedAssociationService_1.default.getFilteredItems(id, ruleCode, Object.assign(Object.assign({}, options), { limit: undefined, skip: undefined }));
        res.status(200).json({
            success: true,
            data: {
                items,
                pagination: {
                    total: totalItems.length,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(totalItems.length / limitNum)
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Filtrelenmiş item\'lar getirilirken hata oluştu'
        });
    }
});
exports.getFilteredItemsByRule = getFilteredItemsByRule;
// GET association metadata
const getItemAssociationMetadata = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, ruleCode } = req.params;
        const metadata = yield enhancedAssociationService_1.default.getAssociationMetadata(id, ruleCode);
        res.status(200).json({
            success: true,
            data: metadata
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Association metadata getirilirken hata oluştu'
        });
    }
});
exports.getItemAssociationMetadata = getItemAssociationMetadata;
// POST kural tabanlı association oluştur
const createRuleBasedAssociation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, ruleCode } = req.params;
        const { targetItemIds } = req.body;
        if (!Array.isArray(targetItemIds) || targetItemIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Target item ID\'leri gerekli'
            });
            return;
        }
        yield enhancedAssociationService_1.default.createAssociationWithRules(id, targetItemIds, ruleCode);
        res.status(201).json({
            success: true,
            message: 'Association başarıyla oluşturuldu'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Association oluşturulamadı'
        });
    }
});
exports.createRuleBasedAssociation = createRuleBasedAssociation;
