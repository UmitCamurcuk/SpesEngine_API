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
exports.getFamiliesByCategory = exports.deleteFamily = exports.updateFamily = exports.createFamily = exports.getFamilyById = exports.getFamilies = void 0;
const Family_1 = __importDefault(require("../models/Family"));
const historyService_1 = __importDefault(require("../services/historyService"));
const History_1 = require("../models/History");
const Entity_1 = require("../models/Entity");
// GET tüm aileleri getir
const getFamilies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Arama parametresi (name ve code alanlarında)
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filterParams.$or = [
                { name: searchRegex },
                { code: searchRegex }
            ];
        }
        // Sıralama parametreleri
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;
        // Toplam kayıt sayısını al
        const total = yield Family_1.default.countDocuments(filterParams);
        // Verileri getir
        const families = yield Family_1.default.find(filterParams)
            .populate('name')
            .populate('description')
            .populate('itemType')
            .populate('parent')
            .populate({
            path: 'category',
            populate: [
                { path: 'name' },
                { path: 'description' }
            ]
        })
            .populate({
            path: 'attributeGroups',
            populate: [
                { path: 'name' },
                { path: 'description' },
                { path: 'attributes', populate: [
                        { path: 'name' },
                        { path: 'description' }
                    ] }
            ]
        })
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name' },
                { path: 'description' }
            ]
        })
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        // Sayfa sayısını hesapla
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            count: families.length,
            total,
            page,
            pages,
            data: families
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Aileler getirilirken bir hata oluştu'
        });
    }
});
exports.getFamilies = getFamilies;
// GET tek bir aileyi getir
const getFamilyById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Query parametrelerini al
        const includeAttributes = req.query.includeAttributes === 'true';
        const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
        const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes === 'true';
        // AttributeGroup modelini içe aktar
        const AttributeGroup = yield Promise.resolve().then(() => __importStar(require('../models/AttributeGroup')));
        // Önce temel Family verisini getir
        const family = yield Family_1.default.findById(req.params.id)
            .populate('name')
            .populate('description')
            .populate('itemType')
            .populate('parent')
            .populate({
            path: 'category',
            populate: [
                { path: 'name' },
                { path: 'description' }
            ]
        })
            .populate(includeAttributes ? {
            path: 'attributes',
            populate: [
                { path: 'name' },
                { path: 'description' }
            ]
        } : []);
        if (!family) {
            res.status(404).json({
                success: false,
                message: 'Aile bulunamadı'
            });
            return;
        }
        // JSON formatına dönüştür (daha sonra manipüle edebilmek için)
        const response = family.toJSON();
        // AttributeGroups için özel işlem
        if (includeAttributeGroups) {
            // Grupları manuel olarak doldur
            if (family.attributeGroups && family.attributeGroups.length > 0) {
                const groupIds = family.attributeGroups.map((g) => g.toString());
                // AttributeGroup'ları ve içindeki öznitelikleri getir
                const groups = yield AttributeGroup.default.find({ _id: { $in: groupIds } })
                    .populate('name', 'key namespace translations')
                    .populate('description', 'key namespace translations')
                    .populate(populateAttributeGroupsAttributes ? {
                    path: 'attributes',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' }
                    ]
                } : []);
                // Yanıta ekle
                response.attributeGroups = groups.map(g => g.toJSON());
            }
        }
        // Category işleme 
        if (response.category) {
            // Category'nin attributes'larını getir
            if (includeAttributes && response.category) {
                const Category = yield Promise.resolve().then(() => __importStar(require('../models/Category')));
                const category = yield Category.default.findById(response.category._id)
                    .populate({
                    path: 'attributes',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' }
                    ]
                });
                if (category && category.attributes) {
                    response.category.attributes = category.attributes;
                }
            }
            // Category'nin attributeGroups'larını getir
            if (includeAttributeGroups && response.category) {
                const Category = yield Promise.resolve().then(() => __importStar(require('../models/Category')));
                const category = yield Category.default.findById(response.category._id)
                    .populate({
                    path: 'attributeGroups',
                    populate: [
                        { path: 'name', select: 'key namespace translations' },
                        { path: 'description', select: 'key namespace translations' },
                        ...(populateAttributeGroupsAttributes ? [{
                                path: 'attributes',
                                populate: [
                                    { path: 'name', select: 'key namespace translations' },
                                    { path: 'description', select: 'key namespace translations' }
                                ]
                            }] : [])
                    ]
                });
                if (category && category.attributeGroups) {
                    response.category.attributeGroups = category.attributeGroups;
                }
            }
        }
        // Sonucu gönder
        res.status(200).json({
            success: true,
            data: response
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Aile getirilirken bir hata oluştu'
        });
    }
});
exports.getFamilyById = getFamilyById;
// POST yeni aile oluştur
const createFamily = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Eğer itemType alanı boş string ise bu alanı kaldır
        if (req.body.itemType === '') {
            delete req.body.itemType;
        }
        // Eğer parent alanı boş string ise bu alanı kaldır
        if (req.body.parent === '') {
            delete req.body.parent;
        }
        // AttributeGroups belirlenmişse, içindeki attribute'ları da ekle
        if (req.body.attributeGroups && req.body.attributeGroups.length > 0) {
            const attributeGroupIds = req.body.attributeGroups;
            // AttributeGroup'lara ait tüm attribute'ları getir
            const allAttributes = yield (yield Promise.resolve().then(() => __importStar(require('../models/AttributeGroup')))).default
                .find({ _id: { $in: attributeGroupIds } })
                .distinct('attributes');
            // Body'ye attributes dizisini ekle veya güncelle
            req.body.attributes = Array.from(new Set([
                ...(req.body.attributes || []),
                ...allAttributes
            ]));
        }
        const family = yield Family_1.default.create(req.body);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.FAMILY,
                    entityId: String(family._id),
                    entityName: String(family.name),
                    action: History_1.ActionType.CREATE,
                    userId: userId,
                    newData: {
                        name: String(family.name),
                        code: family.code,
                        description: String(family.description || ''),
                        isActive: family.isActive
                    }
                });
            }
            catch (historyError) {
                console.error('History creation failed for family:', historyError);
                // History hatası aile oluşturmayı engellemesin
            }
        }
        // Oluşturulan aileyi itemType ve parent alanlarıyla birlikte getir
        const newFamily = yield Family_1.default.findById(family._id)
            .populate('name')
            .populate('description')
            .populate('itemType')
            .populate('parent')
            .populate({
            path: 'category',
            populate: [
                { path: 'name' },
                { path: 'description' }
            ]
        })
            .populate({
            path: 'attributeGroups',
            populate: [
                { path: 'name' },
                { path: 'description' },
                { path: 'attributes', populate: [
                        { path: 'name' },
                        { path: 'description' }
                    ] }
            ]
        })
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name' },
                { path: 'description' }
            ]
        });
        res.status(201).json({
            success: true,
            data: newFamily
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Aile oluşturulurken bir hata oluştu'
        });
    }
});
exports.createFamily = createFamily;
// PUT aileyi güncelle
const updateFamily = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Güncellemeden önce mevcut veriyi al
        const oldFamily = yield Family_1.default.findById(req.params.id);
        if (!oldFamily) {
            res.status(404).json({
                success: false,
                message: 'Aile bulunamadı'
            });
            return;
        }
        // Eğer itemType alanı boş string ise bu alanı kaldır
        if (req.body.itemType === '') {
            delete req.body.itemType;
        }
        // Eğer parent alanı boş string ise bu alanı kaldır
        if (req.body.parent === '') {
            delete req.body.parent;
        }
        // AttributeGroups belirlenmişse, içindeki attribute'ları da ekle
        if (req.body.attributeGroups && req.body.attributeGroups.length > 0) {
            const attributeGroupIds = req.body.attributeGroups;
            // AttributeGroup'lara ait tüm attribute'ları getir
            const allAttributes = yield (yield Promise.resolve().then(() => __importStar(require('../models/AttributeGroup')))).default
                .find({ _id: { $in: attributeGroupIds } })
                .distinct('attributes');
            // Body'ye attributes dizisini ekle veya güncelle
            req.body.attributes = Array.from(new Set([
                ...(req.body.attributes || []),
                ...allAttributes
            ]));
        }
        else {
            // AttributeGroups boşsa, attributes da boş olmalı
            req.body.attributes = [];
        }
        const family = yield Family_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('itemType')
            .populate('parent')
            .populate({
            path: 'attributeGroups',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        })
            .populate({
            path: 'attributes',
            populate: [
                { path: 'name', select: 'key namespace translations' },
                { path: 'description', select: 'key namespace translations' }
            ]
        });
        if (!family) {
            res.status(404).json({
                success: false,
                message: 'Aile bulunamadı'
            });
            return;
        }
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.FAMILY,
                    entityId: String(family._id),
                    entityName: String(family.name),
                    action: History_1.ActionType.UPDATE,
                    userId: userId,
                    previousData: {
                        name: String(oldFamily.name),
                        code: oldFamily.code,
                        description: String(oldFamily.description || ''),
                        isActive: oldFamily.isActive
                    },
                    newData: {
                        name: String(family.name),
                        code: family.code,
                        description: String(family.description || ''),
                        isActive: family.isActive
                    }
                });
            }
            catch (historyError) {
                console.error('History update failed for family:', historyError);
                // History hatası güncellemeyi engellemesin
            }
        }
        res.status(200).json({
            success: true,
            data: family
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Aile güncellenirken bir hata oluştu'
        });
    }
});
exports.updateFamily = updateFamily;
// DELETE aileyi sil
const deleteFamily = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Silinmeden önce veriyi al
        const family = yield Family_1.default.findById(req.params.id);
        if (!family) {
            res.status(404).json({
                success: false,
                message: 'Aile bulunamadı'
            });
            return;
        }
        // Veriyi sil
        yield Family_1.default.findByIdAndDelete(req.params.id);
        // History kaydı oluştur
        if (req.user && typeof req.user === 'object' && '_id' in req.user) {
            const userId = String(req.user._id);
            try {
                yield historyService_1.default.recordHistory({
                    entityType: Entity_1.EntityType.FAMILY,
                    entityId: String(family._id),
                    entityName: String(family.name),
                    action: History_1.ActionType.DELETE,
                    userId: userId,
                    previousData: {
                        name: String(family.name),
                        code: family.code,
                        description: String(family.description || ''),
                        isActive: family.isActive
                    }
                });
            }
            catch (historyError) {
                console.error('History deletion failed for family:', historyError);
                // History hatası silme işlemini engellemesin
            }
        }
        // Entity'nin tüm history kayıtlarını sil
        try {
            const deletedHistoryCount = yield historyService_1.default.deleteEntityHistory(req.params.id);
        }
        catch (historyError) {
            console.error('Error deleting family history:', historyError);
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
            message: error.message || 'Aile silinirken bir hata oluştu'
        });
    }
});
exports.deleteFamily = deleteFamily;
// GET kategoriye göre aileleri getir
const getFamiliesByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        // Bu kategoriye ait tüm aileleri getir
        const families = yield Family_1.default.find({
            category: categoryId,
            isActive: true
        })
            .populate('name')
            .populate('description')
            .populate('itemType')
            .populate({
            path: 'category',
            populate: [
                { path: 'name' },
                { path: 'description' }
            ]
        })
            .populate('parent')
            .sort('name');
        res.status(200).json({
            success: true,
            data: families
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Kategori aileleri getirilirken bir hata oluştu'
        });
    }
});
exports.getFamiliesByCategory = getFamiliesByCategory;
