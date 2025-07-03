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
// PUT kategoriyi güncelle
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Güncellemeden önce mevcut veriyi al
        const oldCategory = yield Category_1.default.findById(id);
        if (!oldCategory) {
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        // Field isimleri dönüşümü
        const updateData = Object.assign({}, req.body);
        // parentCategory -> parent dönüşümü
        if (updateData.parentCategory) {
            updateData.parent = updateData.parentCategory;
            delete updateData.parentCategory;
        }
        // attributeGroups kontrolü
        if (updateData.attributeGroups) {
            updateData.attributeGroups = Array.isArray(updateData.attributeGroups)
                ? updateData.attributeGroups
                : [updateData.attributeGroups];
        }
        // Eski attributeGroup -> attributeGroups dönüşümü
        else if (updateData.attributeGroup) {
            updateData.attributeGroups = Array.isArray(updateData.attributeGroup)
                ? updateData.attributeGroup
                : [updateData.attributeGroup];
            delete updateData.attributeGroup;
        }
        const category = yield Category_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate({
            path: 'family',
            select: 'name code description'
        })
            .populate({
            path: 'parent',
            select: 'name code description'
        })
            .populate({
            path: 'attributeGroups',
            select: 'name code description'
        })
            .populate({
            path: 'attributes',
            select: 'name code type description'
        });
        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                // Sadece temel alanları karşılaştır
                const previousData = {
                    name: String(oldCategory.name),
                    code: oldCategory.code,
                    description: String(oldCategory.description),
                    isActive: oldCategory.isActive,
                    family: String(oldCategory.family || ''),
                    parent: String(oldCategory.parent || ''),
                    attributeGroups: (oldCategory.attributeGroups || []).map(id => String(id))
                };
                const newData = {
                    name: String(category.name),
                    code: category.code,
                    description: String(category.description),
                    isActive: category.isActive,
                    family: String(category.family || ''),
                    parent: String(category.parent || ''),
                    attributeGroups: (category.attributeGroups || []).map(id => String(id))
                };
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.CATEGORY,
                    entityId: String(category._id),
                    entityName: category.code,
                    action: History_1.ActionType.UPDATE,
                    userId: userId,
                    previousData,
                    newData
                });
            }
            catch (historyError) {
                console.error('History update failed for category:', historyError);
                // History hatası güncellemeyi engellemesin
            }
        }
        res.status(200).json({
            success: true,
            data: category
        });
    }
    catch (error) {
        console.error('Error updating category:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Kategori güncellenirken bir hata oluştu'
        });
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
        // Family modeli üzerinden ItemType'ın kategorilerini bul
        const Family = yield Promise.resolve().then(() => __importStar(require('../models/Family')));
        // Bu ItemType'a ait tüm aileleri getir
        const families = yield Family.default.find({
            itemType: itemTypeId,
            isActive: true
        }).select('category').populate('category');
        if (!families || families.length === 0) {
            res.status(200).json({
                success: true,
                data: [],
                message: 'Bu öğe tipi için kategori bulunamadı'
            });
            return;
        }
        // Kategorileri unique yap ve tree format'a çevir
        const categoryIds = [...new Set(families.map(f => { var _a, _b; return (_b = (_a = f.category) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); }).filter(Boolean))];
        const categories = yield Category_1.default.find({
            _id: { $in: categoryIds },
            isActive: true
        })
            .populate('name', 'key namespace translations')
            .populate('description', 'key namespace translations')
            .populate('parent')
            .sort('name');
        res.status(200).json({
            success: true,
            data: categories
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
