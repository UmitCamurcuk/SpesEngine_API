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
exports.getCategoriesByItemType = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const historyService_1 = __importDefault(require("../services/historyService"));
const History_1 = require("../models/History");
const Entity_1 = require("../models/Entity");
const Family_1 = __importDefault(require("../models/Family"));
// GET tüm kategorileri getir (filtreleme ve sayfalama ile)
const getCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sayfalama parametreleri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filtreleme parametreleri
        const filterParams = { isActive: req.query.isActive === 'false' ? false : true };
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filterParams.$or = [
                { name: searchRegex },
                { code: searchRegex },
                { description: searchRegex }
            ];
        }
        if (req.query.family) {
            filterParams.family = req.query.family;
        }
        if (req.query.parentCategory) {
            filterParams.parent = req.query.parentCategory;
        }
        if (req.query.attributeGroups) {
            filterParams.attributeGroups = { $in: Array.isArray(req.query.attributeGroups)
                    ? req.query.attributeGroups
                    : [req.query.attributeGroups] };
        }
        // Toplam kayıt sayısını al
        const total = yield Category_1.default.countDocuments(filterParams);
        // Sıralama seçeneği
        const sortOption = {};
        if (req.query.sortBy) {
            sortOption[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
        }
        else {
            sortOption.name = 1; // Varsayılan olarak isme göre artan sırala
        }
        // Kategorileri getir
        const categories = yield Category_1.default.find(filterParams)
            .populate({
            path: 'family',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'parent',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributeGroups',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: categories.length,
            total: total,
            page: page,
            pages: Math.ceil(total / limit),
            data: categories
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Kategoriler getirilirken bir hata oluştu'
        });
    }
});
exports.getCategories = getCategories;
// GET tek bir kategoriyi getir
const getCategoryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Query parametrelerini al
        const includeAttributes = req.query.includeAttributes === 'true';
        const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
        const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes === 'true';
        const includeFamilies = req.query.includeFamilies === 'true';
        // Query oluştur
        let query = Category_1.default.findById(id)
            .populate({
            path: 'family',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'parent',
            select: 'name code description',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate([
            { path: 'name', select: 'key namespace translations' },
            { path: 'description', select: 'key namespace translations' }
        ]);
        // Attributes'ları include et
        if (includeAttributes) {
            query = query.populate({
                path: 'attributes',
                select: 'name code type description',
                populate: [
                    { path: 'name', select: 'key namespace translations' },
                    { path: 'description', select: 'key namespace translations' }
                ]
            });
        }
        // AttributeGroups'ları include et
        if (includeAttributeGroups) {
            if (populateAttributeGroupsAttributes) {
                query = query.populate({
                    path: 'attributeGroups',
                    select: 'name code description attributes',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            model: 'Attribute',
                            select: 'name code type description isRequired options attributeGroup validations',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' }
                            ]
                        }
                    ]
                });
            }
            else {
                query = query.populate({
                    path: 'attributeGroups',
                    select: 'name code description',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' }
                    ]
                });
            }
        }
        // Sorguyu çalıştır
        const category = yield query.exec();
        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        // Family'leri include et
        if (includeFamilies) {
            let families = [];
            // Eğer bu kategori bir family'ye bağlıysa, o family'yi ve alt family'lerini getir
            if (category.family) {
                const mainFamily = yield Family_1.default.findById(category.family)
                    .populate({
                    path: 'name',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'description',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'parent',
                    select: 'name code description isActive'
                })
                    .populate({
                    path: 'attributeGroups',
                    select: 'name code description attributes isActive',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        {
                            path: 'attributes',
                            select: 'name code type description validations isRequired isActive',
                            populate: [
                                { path: 'name', select: 'key namespace translations' },
                                { path: 'description', select: 'key namespace translations' }
                            ]
                        }
                    ]
                })
                    .lean();
                if (mainFamily) {
                    // Ana family'nin alt family'lerini bul
                    const subFamilies = yield Family_1.default.find({
                        parent: mainFamily._id,
                        isActive: true
                    })
                        .populate({
                        path: 'name',
                        select: 'key namespace translations'
                    })
                        .populate({
                        path: 'description',
                        select: 'key namespace translations'
                    })
                        .populate({
                        path: 'parent',
                        select: 'name code description isActive'
                    })
                        .populate({
                        path: 'attributeGroups',
                        select: 'name code description attributes isActive',
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
                    })
                        .lean();
                    mainFamily.subfamilies = subFamilies;
                    families = [mainFamily];
                }
            }
            else {
                // Bu kategori bir family'ye bağlı değilse, bu kategoriye bağlı family'leri bul
                families = yield Family_1.default.find({
                    category: category._id,
                    isActive: true
                })
                    .populate({
                    path: 'name',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'description',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'parent',
                    select: 'name code description isActive'
                })
                    .populate({
                    path: 'attributeGroups',
                    select: 'name code description attributes isActive',
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
                })
                    .lean();
                // Her family için alt family'leri bul
                for (const family of families) {
                    const subFamilies = yield Family_1.default.find({
                        parent: family._id,
                        isActive: true
                    })
                        .populate({
                        path: 'name',
                        select: 'key namespace translations'
                    })
                        .populate({
                        path: 'description',
                        select: 'key namespace translations'
                    })
                        .populate({
                        path: 'parent',
                        select: 'name code description isActive'
                    })
                        .populate({
                        path: 'attributeGroups',
                        select: 'name code description attributes isActive',
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
                    })
                        .lean();
                    family.subfamilies = subFamilies;
                }
            }
            category.families = families;
            // Alt kategorilerin family'lerini de bul (eğer bu kategori alt kategori ise)
            const subcategories = yield Category_1.default.find({
                parent: category._id,
                isActive: true
            })
                .populate({
                path: 'name',
                select: 'key namespace translations'
            })
                .populate({
                path: 'description',
                select: 'key namespace translations'
            })
                .populate({
                path: 'attributeGroups',
                select: 'name code description attributes isActive',
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
            })
                .lean();
            // Her alt kategori için family'leri bul
            for (const subcat of subcategories) {
                const subcatFamilies = yield Family_1.default.find({
                    category: subcat._id,
                    isActive: true
                })
                    .populate({
                    path: 'name',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'description',
                    select: 'key namespace translations'
                })
                    .populate({
                    path: 'parent',
                    select: 'name code description isActive'
                })
                    .populate({
                    path: 'attributeGroups',
                    select: 'name code description attributes isActive',
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
                })
                    .lean();
                // Her alt kategorinin family'leri için alt family'leri bul
                for (const family of subcatFamilies) {
                    const subFamilies = yield Family_1.default.find({
                        parent: family._id,
                        isActive: true
                    })
                        .populate({
                        path: 'name',
                        select: 'key namespace translations'
                    })
                        .populate({
                        path: 'description',
                        select: 'key namespace translations'
                    })
                        .populate({
                        path: 'parent',
                        select: 'name code description isActive'
                    })
                        .populate({
                        path: 'attributeGroups',
                        select: 'name code description attributes isActive',
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
                    })
                        .lean();
                    family.subfamilies = subFamilies;
                }
                subcat.families = subcatFamilies;
            }
            category.subcategories = subcategories;
        }
        res.status(200).json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Error fetching category by ID:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Kategori getirilirken bir hata oluştu'
        });
    }
});
exports.getCategoryById = getCategoryById;
// POST yeni kategori oluştur
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Field isimleri dönüşümü
        const categoryData = Object.assign({}, req.body);
        // Eğer family alanı boş string ise bu alanı kaldır
        if (categoryData.family === '') {
            delete categoryData.family;
        }
        // parentCategory -> parent dönüşümü
        if (categoryData.parentCategory) {
            categoryData.parent = categoryData.parentCategory;
            delete categoryData.parentCategory;
        }
        // attributeGroups kontrolü
        if (categoryData.attributeGroups) {
            categoryData.attributeGroups = Array.isArray(categoryData.attributeGroups)
                ? categoryData.attributeGroups
                : [categoryData.attributeGroups];
        }
        // Eski attributeGroup -> attributeGroups dönüşümü
        else if (categoryData.attributeGroup) {
            categoryData.attributeGroups = Array.isArray(categoryData.attributeGroup)
                ? categoryData.attributeGroup
                : [categoryData.attributeGroup];
            delete categoryData.attributeGroup;
        }
        const category = yield Category_1.default.create(categoryData);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.CATEGORY,
                    entityId: String(category._id),
                    entityName: category.code,
                    action: History_1.ActionType.CREATE,
                    userId: userId,
                    newData: {
                        name: String(category.name),
                        code: category.code,
                        description: String(category.description),
                        isActive: category.isActive,
                        family: String(category.family || ''),
                        parent: String(category.parent || ''),
                        attributeGroups: (category.attributeGroups || []).map(id => String(id))
                    }
                });
            }
            catch (historyError) {
                console.error('History creation failed for category:', historyError);
                // History hatası kategori oluşturmayı engellemesin
            }
        }
        res.status(201).json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Kategori oluşturulurken bir hata oluştu'
        });
    }
});
exports.createCategory = createCategory;
// Bidirectional relationship sync için helper fonksiyon
const syncCategoryFamilyRelationship = (categoryId, newFamilyId, oldFamilyId, comment) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Eski family'den bu category'yi kaldır
        if (oldFamilyId && oldFamilyId !== newFamilyId) {
            yield Family_1.default.findByIdAndUpdate(oldFamilyId, {
                $unset: { category: 1 }
            });
            // Eski family'nin history'sine yaz
            yield historyService_1.default.recordHistory({
                entityType: Entity_1.EntityType.FAMILY,
                entityId: oldFamilyId,
                entityName: 'Family',
                action: History_1.ActionType.UPDATE,
                userId: 'system',
                previousData: { category: categoryId },
                newData: { category: null },
                comment: comment || 'Kategori ilişkisi kaldırıldı (otomatik sync)'
            });
        }
        // Yeni family'ye bu category'yi ata
        if (newFamilyId) {
            // Önce yeni family'nin eski category'sini temizle
            const existingFamily = yield Family_1.default.findById(newFamilyId);
            if ((existingFamily === null || existingFamily === void 0 ? void 0 : existingFamily.category) && existingFamily.category.toString() !== categoryId) {
                yield Category_1.default.findByIdAndUpdate(existingFamily.category, {
                    $unset: { family: 1 }
                });
                // Eski category'nin history'sine yaz
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.CATEGORY,
                    entityId: existingFamily.category.toString(),
                    entityName: 'Category',
                    action: History_1.ActionType.UPDATE,
                    userId: 'system',
                    previousData: { family: newFamilyId },
                    newData: { family: null },
                    comment: 'Aile ilişkisi kaldırıldı (otomatik sync)'
                });
            }
            // Yeni family'yi güncelle
            yield Family_1.default.findByIdAndUpdate(newFamilyId, {
                category: categoryId
            });
            // Yeni family'nin history'sine yaz
            yield historyService_1.default.recordHistory({
                entityType: Entity_1.EntityType.FAMILY,
                entityId: newFamilyId,
                entityName: 'Family',
                action: History_1.ActionType.UPDATE,
                userId: 'system',
                previousData: { category: (existingFamily === null || existingFamily === void 0 ? void 0 : existingFamily.category) || null },
                newData: { category: categoryId },
                comment: comment || 'Kategori ilişkisi eklendi (otomatik sync)'
            });
        }
    }
    catch (error) {
        console.error('Category-Family sync error:', error);
    }
});
// updateCategory fonksiyonunu güncelle
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        // Mevcut category'yi getir
        const existingCategory = yield Category_1.default.findById(id);
        if (!existingCategory) {
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        // Family değişikliğini kontrol et
        const oldFamilyId = (_a = existingCategory.family) === null || _a === void 0 ? void 0 : _a.toString();
        const newFamilyId = req.body.family;
        // Eğer family alanı boş string, null veya undefined ise bu alanı kaldır
        if (!req.body.family || req.body.family === '' || req.body.family === null) {
            delete req.body.family;
        }
        // Eğer parent alanı boş string, null veya undefined ise bu alanı kaldır
        if (!req.body.parent || req.body.parent === '' || req.body.parent === null) {
            delete req.body.parent;
        }
        // parentCategory -> parent dönüşümü
        if (req.body.parentCategory) {
            req.body.parent = req.body.parentCategory;
            delete req.body.parentCategory;
        }
        // Field isimleri dönüşümü
        const updateData = Object.assign({}, req.body);
        // Kategoriyi güncelle
        const updatedCategory = yield Category_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
            populate: [
                { path: 'name', model: 'Localization' },
                { path: 'description', model: 'Localization' },
                { path: 'parent', populate: { path: 'name', model: 'Localization' } },
                { path: 'family', populate: { path: 'name', model: 'Localization' } },
                { path: 'attributes', populate: { path: 'name', model: 'Localization' } },
                { path: 'attributeGroups', populate: { path: 'name', model: 'Localization' } }
            ]
        });
        if (!updatedCategory) {
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        // Bidirectional sync - Family değişikliği varsa
        if (oldFamilyId !== newFamilyId) {
            yield syncCategoryFamilyRelationship(id, newFamilyId, oldFamilyId, req.body.comment);
        }
        // History kaydı oluştur
        if (req.body.comment || Object.keys(updateData).length > 0) {
            yield historyService_1.default.recordHistory({
                entityType: Entity_1.EntityType.CATEGORY,
                entityId: id,
                entityName: updatedCategory.code,
                action: History_1.ActionType.UPDATE,
                userId: String((_b = req.user) === null || _b === void 0 ? void 0 : _b._id),
                previousData: {
                    name: String(existingCategory.name),
                    code: existingCategory.code,
                    description: String(existingCategory.description),
                    isActive: existingCategory.isActive,
                    family: String(existingCategory.family || ''),
                    parent: String(existingCategory.parent || ''),
                    attributeGroups: (existingCategory.attributeGroups || []).map(id => String(id))
                },
                newData: updateData,
                comment: req.body.comment
            });
        }
        res.status(200).json({
            success: true,
            message: 'Kategori başarıyla güncellendi',
            data: updatedCategory
        });
    }
    catch (error) {
        console.error('Category update error:', error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Doğrulama hatası',
                errors: validationErrors
            });
            return;
        }
        if (error.name === 'CastError') {
            res.status(400).json({
                success: false,
                message: 'Geçersiz kategori ID formatı'
            });
            return;
        }
        next(error);
    }
});
exports.updateCategory = updateCategory;
// DELETE kategoriyi sil
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Silinmeden önce veriyi al
        const category = yield Category_1.default.findById(id);
        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        // Veriyi sil
        yield Category_1.default.findByIdAndDelete(id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.CATEGORY,
                    entityId: String(category._id),
                    entityName: category.code,
                    action: History_1.ActionType.DELETE,
                    userId: userId,
                    previousData: {
                        name: String(category.name),
                        code: category.code,
                        description: String(category.description),
                        isActive: category.isActive,
                        family: String(category.family || ''),
                        parent: String(category.parent || ''),
                        attributeGroups: (category.attributeGroups || []).map(id => String(id))
                    }
                });
            }
            catch (historyError) {
                console.error('History deletion failed for category:', historyError);
                // History hatası silme işlemini engellemesin
            }
        }
        // Entity'nin tüm history kayıtlarını sil
        try {
            const deletedHistoryCount = yield historyService_1.default.deleteEntityHistory(id);
        }
        catch (historyError) {
            console.error('Error deleting category history:', historyError);
            // History silme hatası ana işlemi engellemesin
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Kategori silinirken bir hata oluştu'
        });
    }
});
exports.deleteCategory = deleteCategory;
// GET ItemType'a göre kategorileri getir
const getCategoriesByItemType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemTypeId } = req.params;
        // Önce ItemType'ı bul ve category'sini al
        const ItemType = yield Promise.resolve().then(() => __importStar(require('../models/ItemType')));
        const itemType = yield ItemType.default.findById(itemTypeId);
        if (!itemType) {
            res.status(404).json({
                success: false,
                message: 'ItemType bulunamadı'
            });
            return;
        }
        // ItemType'ın category'si yoksa boş dön
        if (!itemType.category) {
            res.status(200).json({
                success: true,
                data: [],
                message: 'Bu ItemType için kategori tanımlanmamış'
            });
            return;
        }
        // ItemType'ın category'sini getir
        const category = yield Category_1.default.findById(itemType.category)
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate('parent');
        if (!category) {
            res.status(200).json({
                success: true,
                data: [],
                message: 'ItemType kategorisi bulunamadı'
            });
            return;
        }
        // Bu kategoriye ait tüm Family'leri de getir
        const Family = yield Promise.resolve().then(() => __importStar(require('../models/Family')));
        const families = yield Family.default.find({
            category: itemType.category,
            isActive: true
        })
            .select('_id name code')
            .populate('name', 'key namespace translations');
        // Bu kategorinin alt kategorilerini bul (parent field'ı bu kategori olan kategoriler)
        const subCategories = yield Category_1.default.find({
            parent: itemType.category,
            isActive: true
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate('parent');
        // Her alt kategori için de family'leri getir
        const subCategoriesWithFamilies = yield Promise.all(subCategories.map((subCat) => __awaiter(void 0, void 0, void 0, function* () {
            const subFamilies = yield Family.default.find({
                category: subCat._id,
                isActive: true
            })
                .select('_id name code')
                .populate('name', 'key namespace translations');
            return Object.assign(Object.assign({}, subCat.toObject()), { families: subFamilies });
        })));
        // Ana kategoriyi response'a ekle
        const categoryWithFamilies = Object.assign(Object.assign({}, category.toObject()), { families: families, subCategories: subCategoriesWithFamilies });
        res.status(200).json({
            success: true,
            data: [categoryWithFamilies]
        });
    }
    catch (error) {
        console.error('Error fetching categories by ItemType:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'ItemType kategorileri getirilirken bir hata oluştu'
        });
    }
});
exports.getCategoriesByItemType = getCategoriesByItemType;
