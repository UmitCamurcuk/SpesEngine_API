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
        const family = yield Family_1.default.findById(req.params.id)
            .populate('itemType');
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
        const family = yield Family_1.default.create(req.body);
        // Oluşturulan aileyi itemType alanıyla birlikte getir
        const newFamily = yield Family_1.default.findById(family._id)
            .populate('itemType');
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
        const family = yield Family_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('itemType');
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
