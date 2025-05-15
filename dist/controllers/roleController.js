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
exports.deleteRole = exports.updateRole = exports.getRoleById = exports.createRole = exports.getRoles = void 0;
const Role_1 = __importDefault(require("../models/Role"));
const Permission_1 = __importDefault(require("../models/Permission"));
// @desc    Tüm rolleri getir
// @route   GET /api/roles
// @access  Private
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = yield Role_1.default.countDocuments();
        const roles = yield Role_1.default.find()
            .populate('permissions', 'name code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: roles.length,
            total,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            },
            roles
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Roller getirilemedi',
            error: error.message
        });
    }
});
exports.getRoles = getRoles;
// @desc    Yeni bir rol oluştur
// @route   POST /api/roles
// @access  Private
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, permissions } = req.body;
        // Rol zaten var mı kontrol et
        const existingRole = yield Role_1.default.findOne({ name });
        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: 'Bu isim ile bir rol zaten mevcut'
            });
        }
        // İzinler var mı kontrol et
        if (permissions && permissions.length > 0) {
            const permissionCount = yield Permission_1.default.countDocuments({
                _id: { $in: permissions }
            });
            if (permissionCount !== permissions.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Bazı izinler bulunamadı'
                });
            }
        }
        // Yeni rol oluştur
        const role = yield Role_1.default.create({
            name,
            description,
            permissions: permissions || []
        });
        const populatedRole = yield Role_1.default.findById(role._id).populate('permissions', 'name code');
        res.status(201).json({
            success: true,
            message: 'Rol başarıyla oluşturuldu',
            role: populatedRole
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Rol oluşturulamadı',
            error: error.message
        });
    }
});
exports.createRole = createRole;
// @desc    Belirli bir rolü getir
// @route   GET /api/roles/:id
// @access  Private
const getRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield Role_1.default.findById(req.params.id).populate('permissions', 'name code description');
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }
        res.status(200).json({
            success: true,
            role
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Rol getirilemedi',
            error: error.message
        });
    }
});
exports.getRoleById = getRoleById;
// @desc    Rolü güncelle
// @route   PUT /api/roles/:id
// @access  Private
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, permissions, isActive } = req.body;
        // İsim değiştiriliyorsa, başka bir rol ile çakışıyor mu kontrol et
        if (name) {
            const existingRole = yield Role_1.default.findOne({
                name,
                _id: { $ne: req.params.id }
            });
            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isim ile başka bir rol zaten mevcut'
                });
            }
        }
        // İzinler değiştiriliyorsa, var mı kontrol et
        if (permissions && permissions.length > 0) {
            const permissionCount = yield Permission_1.default.countDocuments({
                _id: { $in: permissions }
            });
            if (permissionCount !== permissions.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Bazı izinler bulunamadı'
                });
            }
        }
        // Rolü güncelle
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (permissions)
            updateData.permissions = permissions;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const role = yield Role_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('permissions', 'name code');
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Rol başarıyla güncellendi',
            role
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Rol güncellenemedi',
            error: error.message
        });
    }
});
exports.updateRole = updateRole;
// @desc    Rolü sil
// @route   DELETE /api/roles/:id
// @access  Private
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield Role_1.default.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }
        yield role.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Rol başarıyla silindi'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Rol silinemedi',
            error: error.message
        });
    }
});
exports.deleteRole = deleteRole;
