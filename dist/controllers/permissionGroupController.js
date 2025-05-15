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
exports.deletePermissionGroup = exports.updatePermissionGroup = exports.getPermissionGroupById = exports.createPermissionGroup = exports.getPermissionGroups = void 0;
const PermissionGroup_1 = __importDefault(require("../models/PermissionGroup"));
// @desc    Tüm izin gruplarını getir
// @route   GET /api/permissionGroups
// @access  Private
const getPermissionGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = yield PermissionGroup_1.default.countDocuments();
        const permissionGroups = yield PermissionGroup_1.default.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: permissionGroups.length,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            },
            permissionGroups
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin grupları getirilemedi',
            error: error.message
        });
    }
});
exports.getPermissionGroups = getPermissionGroups;
// @desc    Yeni bir izin grubu oluştur
// @route   POST /api/permissionGroups
// @access  Private
const createPermissionGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, code } = req.body;
        // İzin grubu zaten var mı kontrol et
        const existingPermissionGroup = yield PermissionGroup_1.default.findOne({
            $or: [{ name }, { code }]
        });
        if (existingPermissionGroup) {
            return res.status(400).json({
                success: false,
                message: 'Bu isim veya kod ile bir izin grubu zaten mevcut'
            });
        }
        // Yeni izin grubu oluştur
        const permissionGroup = yield PermissionGroup_1.default.create({
            name,
            description,
            code
        });
        res.status(201).json({
            success: true,
            message: 'İzin grubu başarıyla oluşturuldu',
            permissionGroup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin grubu oluşturulamadı',
            error: error.message
        });
    }
});
exports.createPermissionGroup = createPermissionGroup;
// @desc    Belirli bir izin grubunu getir
// @route   GET /api/permissionGroups/:id
// @access  Private
const getPermissionGroupById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissionGroup = yield PermissionGroup_1.default.findById(req.params.id);
        if (!permissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        res.status(200).json({
            success: true,
            permissionGroup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin grubu getirilemedi',
            error: error.message
        });
    }
});
exports.getPermissionGroupById = getPermissionGroupById;
// @desc    İzin grubunu güncelle
// @route   PUT /api/permissionGroups/:id
// @access  Private
const updatePermissionGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, code, isActive } = req.body;
        // İsim veya kod değiştiriliyorsa, başka bir grup ile çakışıyor mu kontrol et
        if (name || code) {
            const query = { _id: { $ne: req.params.id } };
            if (name)
                query.name = name;
            if (code)
                query.code = code;
            const existingPermissionGroup = yield PermissionGroup_1.default.findOne(query);
            if (existingPermissionGroup) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isim veya kod ile başka bir izin grubu zaten mevcut'
                });
            }
        }
        // İzin grubunu güncelle
        const permissionGroup = yield PermissionGroup_1.default.findByIdAndUpdate(req.params.id, { name, description, code, isActive }, { new: true, runValidators: true });
        if (!permissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        res.status(200).json({
            success: true,
            message: 'İzin grubu başarıyla güncellendi',
            permissionGroup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin grubu güncellenemedi',
            error: error.message
        });
    }
});
exports.updatePermissionGroup = updatePermissionGroup;
// @desc    İzin grubunu sil
// @route   DELETE /api/permissionGroups/:id
// @access  Private
const deletePermissionGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissionGroup = yield PermissionGroup_1.default.findById(req.params.id);
        if (!permissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        yield permissionGroup.deleteOne();
        res.status(200).json({
            success: true,
            message: 'İzin grubu başarıyla silindi'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin grubu silinemedi',
            error: error.message
        });
    }
});
exports.deletePermissionGroup = deletePermissionGroup;
