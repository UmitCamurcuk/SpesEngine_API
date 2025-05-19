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
exports.deleteFamily = exports.updateFamily = exports.createFamily = exports.getFamilyById = exports.getFamilies = void 0;
const Family_1 = __importDefault(require("../models/Family"));
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
            .populate('itemType')
            .populate('parent')
            .populate('attributeGroups')
            .populate('attributes')
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
    var _a, _b;
    try {
        // Query parametrelerini al
        const includeAttributes = req.query.includeAttributes === 'true';
        const includeAttributeGroups = req.query.includeAttributeGroups === 'true';
        const populateAttributeGroupsAttributes = req.query.populateAttributeGroupsAttributes === 'true';
        console.log(`[getFamilyById] ID: ${req.params.id}, Parametreler:`, {
            includeAttributes,
            includeAttributeGroups,
            populateAttributeGroupsAttributes
        });
        // Query oluştur
        let query = Family_1.default.findById(req.params.id)
            .populate('itemType')
            .populate('parent');
        // Category'i her zaman populate et (bu alanın zorunlu olduğu gözüküyor)
        query = query.populate('category');
        // Attributes'ları include et
        if (includeAttributes) {
            query = query.populate('attributes');
            // Category içindeki attributes'ları da populate et
            query = query.populate({
                path: 'category',
                populate: {
                    path: 'attributes'
                }
            });
        }
        // AttributeGroups'ları include et ve içindeki attributes'ları da getir
        if (includeAttributeGroups) {
            if (populateAttributeGroupsAttributes) {
                // Family'nin attributeGroups'larını ve içindeki attributes'ları populate et
                query = query.populate({
                    path: 'attributeGroups',
                    model: 'AttributeGroup',
                    populate: {
                        path: 'attributes',
                        model: 'Attribute'
                    }
                });
                // Category'nin attributeGroups'larını ve içindeki attributes'ları populate et
                query = query.populate({
                    path: 'category',
                    populate: {
                        path: 'attributeGroups',
                        model: 'AttributeGroup',
                        populate: {
                            path: 'attributes',
                            model: 'Attribute'
                        }
                    }
                });
            }
            else {
                // Sadece attributeGroups'ları populate et
                query = query.populate('attributeGroups');
                // Category'nin attributeGroups'larını da populate et
                query = query.populate({
                    path: 'category',
                    populate: {
                        path: 'attributeGroups'
                    }
                });
            }
        }
        // Sorguyu çalıştır
        const family = yield query.exec();
        if (!family) {
            res.status(404).json({
                success: false,
                message: 'Aile bulunamadı'
            });
            return;
        }
        console.log(`[getFamilyById] Aile bulundu. Attributes: ${((_a = family.attributes) === null || _a === void 0 ? void 0 : _a.length) || 'yok'}, AttributeGroups: ${((_b = family.attributeGroups) === null || _b === void 0 ? void 0 : _b.length) || 'yok'}`);
        res.status(200).json({
            success: true,
            data: family
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
        // Oluşturulan aileyi itemType ve parent alanlarıyla birlikte getir
        const newFamily = yield Family_1.default.findById(family._id)
            .populate('itemType')
            .populate('parent')
            .populate('attributeGroups')
            .populate('attributes');
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
            .populate('attributeGroups')
            .populate('attributes');
        if (!family) {
            res.status(404).json({
                success: false,
                message: 'Aile bulunamadı'
            });
            return;
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
        const family = yield Family_1.default.findByIdAndDelete(req.params.id);
        if (!family) {
            res.status(404).json({
                success: false,
                message: 'Aile bulunamadı'
            });
            return;
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
