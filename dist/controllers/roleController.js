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
exports.deleteRole = exports.removePermissionGroupFromRole = exports.addPermissionGroupToRole = exports.updateRole = exports.getRoleById = exports.createRole = exports.getRoles = void 0;
const Role_1 = __importDefault(require("../models/Role"));
const PermissionGroup_1 = __importDefault(require("../models/PermissionGroup"));
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
            .populate({
            path: 'permissionGroups.permissionGroup',
            select: 'name code description'
        })
            .populate({
            path: 'permissionGroups.permissions.permission',
            select: 'name description code'
        })
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
        const { name, description, permissionGroups } = req.body;
        // Rol zaten var mı kontrol et
        const existingRole = yield Role_1.default.findOne({ name });
        if (existingRole) {
            return res.status(400).json({
                success: false,
                message: 'Bu isim ile bir rol zaten mevcut'
            });
        }
        // Permission Groups validasyonu
        if (permissionGroups && permissionGroups.length > 0) {
            for (const pg of permissionGroups) {
                // Permission Group var mı kontrol et
                const permissionGroup = yield PermissionGroup_1.default.findById(pg.permissionGroup);
                if (!permissionGroup) {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz izin grubu ID\'si bulundu'
                    });
                }
                // Bu grubun permissions'ları ile validate et
                if (pg.permissions && pg.permissions.length > 0) {
                    const permissionIds = pg.permissions.map((p) => p.permission);
                    const validPermissions = yield Permission_1.default.find({
                        _id: { $in: permissionIds }
                    });
                    if (validPermissions.length !== permissionIds.length) {
                        return res.status(400).json({
                            success: false,
                            message: 'Geçersiz izin ID\'si bulundu'
                        });
                    }
                    // Permissions'ların gerçekten bu gruba ait olup olmadığını kontrol et
                    const groupPermissions = permissionGroup.permissions.map(p => p.toString());
                    for (const permId of permissionIds) {
                        if (!groupPermissions.includes(permId.toString())) {
                            return res.status(400).json({
                                success: false,
                                message: 'Bazı izinler belirtilen gruba ait değil'
                            });
                        }
                    }
                }
            }
        }
        // Yeni rol oluştur
        const role = yield Role_1.default.create({
            name,
            description,
            permissionGroups: permissionGroups || []
        });
        const populatedRole = yield Role_1.default.findById(role._id)
            .populate({
            path: 'permissionGroups.permissionGroup',
            select: 'name code description'
        })
            .populate({
            path: 'permissionGroups.permissions.permission',
            select: 'name description code'
        });
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
        const role = yield Role_1.default.findById(req.params.id)
            .populate({
            path: 'permissionGroups.permissionGroup',
            select: 'name code description permissions',
            populate: {
                path: 'permissions',
                select: 'name description code'
            }
        })
            .populate({
            path: 'permissionGroups.permissions.permission',
            select: 'name description code'
        });
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
        const { name, description, permissionGroups, isActive } = req.body;
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
        // Permission Groups validasyonu
        if (permissionGroups) {
            for (const pg of permissionGroups) {
                // Permission Group var mı kontrol et
                const permissionGroup = yield PermissionGroup_1.default.findById(pg.permissionGroup);
                if (!permissionGroup) {
                    return res.status(400).json({
                        success: false,
                        message: 'Geçersiz izin grubu ID\'si bulundu'
                    });
                }
                // Bu grubun permissions'ları ile validate et
                if (pg.permissions && pg.permissions.length > 0) {
                    const permissionIds = pg.permissions.map((p) => p.permission);
                    const validPermissions = yield Permission_1.default.find({
                        _id: { $in: permissionIds }
                    });
                    if (validPermissions.length !== permissionIds.length) {
                        return res.status(400).json({
                            success: false,
                            message: 'Geçersiz izin ID\'si bulundu'
                        });
                    }
                    // Permissions'ların gerçekten bu gruba ait olup olmadığını kontrol et
                    const groupPermissions = permissionGroup.permissions.map(p => p.toString());
                    for (const permId of permissionIds) {
                        if (!groupPermissions.includes(permId.toString())) {
                            return res.status(400).json({
                                success: false,
                                message: 'Bazı izinler belirtilen gruba ait değil'
                            });
                        }
                    }
                }
            }
        }
        // Rolü güncelle
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        if (permissionGroups)
            updateData.permissionGroups = permissionGroups;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const role = yield Role_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate({
            path: 'permissionGroups.permissionGroup',
            select: 'name code description'
        })
            .populate({
            path: 'permissionGroups.permissions.permission',
            select: 'name description code'
        });
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
// @desc    Role permission group ekle
// @route   POST /api/roles/:id/permissionGroups
// @access  Private
const addPermissionGroupToRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { permissionGroupId, permissions } = req.body;
        // Rol var mı kontrol et
        const role = yield Role_1.default.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }
        // Permission Group var mı kontrol et
        const permissionGroup = yield PermissionGroup_1.default.findById(permissionGroupId);
        if (!permissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        // Bu permission group zaten role ekli mi?
        const existingPG = role.permissionGroups.find(pg => pg.permissionGroup.toString() === permissionGroupId);
        if (existingPG) {
            return res.status(400).json({
                success: false,
                message: 'Bu izin grubu zaten role ekli'
            });
        }
        // Permissions validasyonu
        let validatedPermissions = [];
        if (permissions && permissions.length > 0) {
            const permissionIds = permissions.map((p) => p.permission);
            const validPermissions = yield Permission_1.default.find({
                _id: { $in: permissionIds }
            });
            if (validPermissions.length !== permissionIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz izin ID\'si bulundu'
                });
            }
            // Permissions'ların gerçekten bu gruba ait olup olmadığını kontrol et
            const groupPermissions = permissionGroup.permissions.map(p => p.toString());
            for (const permId of permissionIds) {
                if (!groupPermissions.includes(permId.toString())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Bazı izinler belirtilen gruba ait değil'
                    });
                }
            }
            validatedPermissions = permissions;
        }
        // Permission group'u role ekle
        role.permissionGroups.push({
            permissionGroup: permissionGroupId,
            permissions: validatedPermissions
        });
        yield role.save();
        // Populate ederek dön
        const updatedRole = yield Role_1.default.findById(req.params.id)
            .populate({
            path: 'permissionGroups.permissionGroup',
            select: 'name code description'
        })
            .populate({
            path: 'permissionGroups.permissions.permission',
            select: 'name description code'
        });
        res.status(200).json({
            success: true,
            message: 'İzin grubu başarıyla role eklendi',
            role: updatedRole
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin grubu role eklenemedi',
            error: error.message
        });
    }
});
exports.addPermissionGroupToRole = addPermissionGroupToRole;
// @desc    Rolden permission group çıkar
// @route   DELETE /api/roles/:id/permissionGroups/:permissionGroupId
// @access  Private
const removePermissionGroupFromRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, permissionGroupId } = req.params;
        // Rol var mı kontrol et
        const role = yield Role_1.default.findById(id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
        }
        // Permission group rolde var mı kontrol et
        const permissionGroupIndex = role.permissionGroups.findIndex(pg => pg.permissionGroup.toString() === permissionGroupId);
        if (permissionGroupIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Bu izin grubu rolde mevcut değil'
            });
        }
        // Permission group'u rolden çıkar
        role.permissionGroups.splice(permissionGroupIndex, 1);
        yield role.save();
        // Populate ederek dön
        const updatedRole = yield Role_1.default.findById(id)
            .populate({
            path: 'permissionGroups.permissionGroup',
            select: 'name code description'
        })
            .populate({
            path: 'permissionGroups.permissions.permission',
            select: 'name description code'
        });
        res.status(200).json({
            success: true,
            message: 'İzin grubu başarıyla rolden çıkarıldı',
            role: updatedRole
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin grubu rolden çıkarılamadı',
            error: error.message
        });
    }
});
exports.removePermissionGroupFromRole = removePermissionGroupFromRole;
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
