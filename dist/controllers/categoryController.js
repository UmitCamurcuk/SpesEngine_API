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
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
// GET tüm kategorileri getir (filtreleme ve sayfalama ile)
const getCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Categories fetch request received', req.query);
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
            .sort(sortOption)
            .skip(skip)
            .limit(limit);
        console.log(`Found ${categories.length} categories out of ${total}`);
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
        console.log(`Category fetch by ID request received: ${id}`);
        const category = yield Category_1.default.findById(id)
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
            console.log(`Category not found with ID: ${id}`);
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        console.log(`Found category: ${category.name}`);
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
        console.log('Create category request received:', req.body);
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
        console.log('Processed category data:', categoryData);
        const category = yield Category_1.default.create(categoryData);
        console.log(`Created category: ${category.name} with ID: ${category._id}`);
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
        console.log(`Update category request received for ID: ${id}`, req.body);
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
        console.log('Processed update data:', updateData);
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
            console.log(`Category not found with ID: ${id}`);
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        console.log(`Updated category: ${category.name}`);
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
        console.log(`Delete category request received for ID: ${id}`);
        const category = yield Category_1.default.findByIdAndDelete(id);
        if (!category) {
            console.log(`Category not found with ID: ${id}`);
            res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
            return;
        }
        console.log(`Deleted category with ID: ${id}`);
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
