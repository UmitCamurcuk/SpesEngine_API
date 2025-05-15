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
exports.deletePermission = exports.updatePermission = exports.getPermissionById = exports.createPermission = exports.getPermissions = void 0;
const Permission_1 = __importDefault(require("../models/Permission"));
const PermissionGroup_1 = __importDefault(require("../models/PermissionGroup"));
// @desc    Tüm izinleri getir
// @route   GET /api/permissions
// @access  Private
const getPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = yield Permission_1.default.countDocuments();
        const permissions = yield Permission_1.default.find()
            .populate('permissionGroup', 'name code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: permissions.length,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            },
            permissions
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzinler getirilemedi',
            error: error.message
        });
    }
});
exports.getPermissions = getPermissions;
// @desc    Yeni bir izin oluştur
// @route   POST /api/permissions
// @access  Private
const createPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, code, permissionGroup } = req.body;
        // İzin zaten var mı kontrol et
        const existingPermission = yield Permission_1.default.findOne({
            $or: [{ name }, { code }]
        });
        if (existingPermission) {
            return res.status(400).json({
                success: false,
                message: 'Bu isim veya kod ile bir izin zaten mevcut'
            });
        }
        // İzin grubu var mı kontrol et
        const groupExists = yield PermissionGroup_1.default.findById(permissionGroup);
        if (!groupExists) {
            return res.status(400).json({
                success: false,
                message: 'Belirtilen izin grubu bulunamadı'
            });
        }
        // Yeni izin oluştur
        const permission = yield Permission_1.default.create({
            name,
            description,
            code,
            permissionGroup
        });
        res.status(201).json({
            success: true,
            message: 'İzin başarıyla oluşturuldu',
            permission
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin oluşturulamadı',
            error: error.message
        });
    }
});
exports.createPermission = createPermission;
// @desc    Belirli bir izni getir
// @route   GET /api/permissions/:id
// @access  Private
const getPermissionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permission = yield Permission_1.default.findById(req.params.id).populate('permissionGroup', 'name code');
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'İzin bulunamadı'
            });
        }
        res.status(200).json({
            success: true,
            permission
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin getirilemedi',
            error: error.message
        });
    }
});
exports.getPermissionById = getPermissionById;
// @desc    İzni güncelle
// @route   PUT /api/permissions/:id
// @access  Private
const updatePermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, code, permissionGroup, isActive } = req.body;
        // İsim veya kod değiştiriliyorsa, başka bir izin ile çakışıyor mu kontrol et
        if (name || code) {
            const query = { _id: { $ne: req.params.id } };
            if (name)
                query.name = name;
            if (code)
                query.code = code;
            const existingPermission = yield Permission_1.default.findOne(query);
            if (existingPermission) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isim veya kod ile başka bir izin zaten mevcut'
                });
            }
        }
        // İzin grubu değiştiriliyorsa, yeni grup var mı kontrol et
        if (permissionGroup) {
            const groupExists = yield PermissionGroup_1.default.findById(permissionGroup);
            if (!groupExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Belirtilen izin grubu bulunamadı'
                });
            }
        }
        // İzni güncelle
        const permission = yield Permission_1.default.findByIdAndUpdate(req.params.id, { name, description, code, permissionGroup, isActive }, { new: true, runValidators: true }).populate('permissionGroup', 'name code');
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'İzin bulunamadı'
            });
        }
        res.status(200).json({
            success: true,
            message: 'İzin başarıyla güncellendi',
            permission
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin güncellenemedi',
            error: error.message
        });
    }
});
exports.updatePermission = updatePermission;
// @desc    İzni sil
// @route   DELETE /api/permissions/:id
// @access  Private
const deletePermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permission = yield Permission_1.default.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'İzin bulunamadı'
            });
        }
        yield permission.deleteOne();
        res.status(200).json({
            success: true,
            message: 'İzin başarıyla silindi'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin silinemedi',
            error: error.message
        });
    }
});
exports.deletePermission = deletePermission;
