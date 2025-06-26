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
exports.deletePermissionGroup = exports.removePermissionFromGroup = exports.addPermissionToGroup = exports.updatePermissionGroup = exports.getPermissionGroupById = exports.createPermissionGroup = exports.getPermissionGroups = void 0;
const PermissionGroup_1 = __importDefault(require("../models/PermissionGroup"));
const Permission_1 = __importDefault(require("../models/Permission"));
const historyService_1 = __importDefault(require("../services/historyService"));
const Entity_1 = require("../models/Entity");
const History_1 = require("../models/History");
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
            .populate('permissions', 'name description code')
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
    var _a;
    try {
        const { name, description, code, permissions } = req.body;
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
        // Eğer permissions verildiyse, bunların geçerli olup olmadığını kontrol et
        if (permissions && permissions.length > 0) {
            const validPermissions = yield Permission_1.default.find({ _id: { $in: permissions } });
            if (validPermissions.length !== permissions.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz izin ID\'leri bulundu'
                });
            }
        }
        // Yeni izin grubu oluştur
        const permissionGroup = yield PermissionGroup_1.default.create({
            name,
            description,
            code,
            permissions: permissions || []
        });
        // Populate ederek dön
        const populatedPermissionGroup = yield PermissionGroup_1.default.findById(permissionGroup._id)
            .populate('permissions', 'name description code');
        // History kaydı oluştur
        try {
            yield historyService_1.default.recordHistory({
                entityId: String(permissionGroup._id),
                entityType: Entity_1.EntityType.PERMISSION_GROUP,
                entityName: permissionGroup.name,
                entityCode: permissionGroup.code,
                action: History_1.ActionType.CREATE,
                userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? String(req.user.id) : 'system',
                newData: {
                    name: permissionGroup.name,
                    description: permissionGroup.description,
                    code: permissionGroup.code,
                    permissions: permissionGroup.permissions,
                    isActive: permissionGroup.isActive
                },
                comment: 'İzin grubu oluşturuldu'
            });
        }
        catch (historyError) {
            console.error('History kaydı oluşturulamadı:', historyError);
            // History hatası ana işlemi durdurmasın
        }
        res.status(201).json({
            success: true,
            message: 'İzin grubu başarıyla oluşturuldu',
            permissionGroup: populatedPermissionGroup
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
        const permissionGroup = yield PermissionGroup_1.default.findById(req.params.id)
            .populate('permissions', 'name description code');
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
    var _a;
    try {
        const { name, description, code, permissions, isActive, comment } = req.body;
        // Mevcut izin grubunu al (history için)
        const existingPermissionGroup = yield PermissionGroup_1.default.findById(req.params.id)
            .populate('permissions', 'name description code');
        if (!existingPermissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        // İsim veya kod değiştiriliyorsa, başka bir grup ile çakışıyor mu kontrol et
        if (name || code) {
            const query = { _id: { $ne: req.params.id } };
            if (name)
                query.name = name;
            if (code)
                query.code = code;
            const duplicatePermissionGroup = yield PermissionGroup_1.default.findOne(query);
            if (duplicatePermissionGroup) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isim veya kod ile başka bir izin grubu zaten mevcut'
                });
            }
        }
        // Eğer permissions verildiyse, bunların geçerli olup olmadığını kontrol et
        if (permissions && permissions.length > 0) {
            const validPermissions = yield Permission_1.default.find({ _id: { $in: permissions } });
            if (validPermissions.length !== permissions.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz izin ID\'leri bulundu'
                });
            }
        }
        // İzin grubunu güncelle
        const permissionGroup = yield PermissionGroup_1.default.findByIdAndUpdate(req.params.id, { name, description, code, permissions, isActive }, { new: true, runValidators: true }).populate('permissions', 'name description code');
        if (!permissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        // History kaydı oluştur
        try {
            yield historyService_1.default.recordHistory({
                entityId: req.params.id,
                entityType: Entity_1.EntityType.PERMISSION_GROUP,
                entityName: permissionGroup.name,
                entityCode: permissionGroup.code,
                action: History_1.ActionType.UPDATE,
                userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? String(req.user.id) : 'system',
                previousData: {
                    name: existingPermissionGroup.name,
                    description: existingPermissionGroup.description,
                    code: existingPermissionGroup.code,
                    permissions: existingPermissionGroup.permissions,
                    isActive: existingPermissionGroup.isActive
                },
                newData: {
                    name: permissionGroup.name,
                    description: permissionGroup.description,
                    code: permissionGroup.code,
                    permissions: permissionGroup.permissions,
                    isActive: permissionGroup.isActive
                },
                comment: comment || 'İzin grubu güncellendi'
            });
        }
        catch (historyError) {
            console.error('History kaydı oluşturulamadı:', historyError);
            // History hatası ana işlemi durdurmasın
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
// @desc    İzin grubuna izin ekle
// @route   POST /api/permissionGroups/:id/permissions
// @access  Private
const addPermissionToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { permissionId } = req.body;
        // İzin grubu var mı kontrol et
        const permissionGroup = yield PermissionGroup_1.default.findById(req.params.id);
        if (!permissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        // İzin var mı kontrol et
        const permission = yield Permission_1.default.findById(permissionId);
        if (!permission) {
            return res.status(404).json({
                success: false,
                message: 'İzin bulunamadı'
            });
        }
        // İzin zaten grupta var mı kontrol et
        if (permissionGroup.permissions.includes(permissionId)) {
            return res.status(400).json({
                success: false,
                message: 'Bu izin zaten grupta mevcut'
            });
        }
        // İzni gruba ekle
        permissionGroup.permissions.push(permissionId);
        yield permissionGroup.save();
        // Populate ederek dön
        const updatedPermissionGroup = yield PermissionGroup_1.default.findById(req.params.id)
            .populate('permissions', 'name description code');
        res.status(200).json({
            success: true,
            message: 'İzin başarıyla gruba eklendi',
            permissionGroup: updatedPermissionGroup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin gruba eklenemedi',
            error: error.message
        });
    }
});
exports.addPermissionToGroup = addPermissionToGroup;
// @desc    İzin grubundan izin çıkar
// @route   DELETE /api/permissionGroups/:id/permissions/:permissionId
// @access  Private
const removePermissionFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, permissionId } = req.params;
        // İzin grubu var mı kontrol et
        const permissionGroup = yield PermissionGroup_1.default.findById(id);
        if (!permissionGroup) {
            return res.status(404).json({
                success: false,
                message: 'İzin grubu bulunamadı'
            });
        }
        // İzin grupta var mı kontrol et
        if (!permissionGroup.permissions.includes(permissionId)) {
            return res.status(400).json({
                success: false,
                message: 'Bu izin grupta mevcut değil'
            });
        }
        // İzni gruptan çıkar
        permissionGroup.permissions = permissionGroup.permissions.filter(p => p.toString() !== permissionId);
        yield permissionGroup.save();
        // Populate ederek dön
        const updatedPermissionGroup = yield PermissionGroup_1.default.findById(id)
            .populate('permissions', 'name description code');
        res.status(200).json({
            success: true,
            message: 'İzin başarıyla gruptan çıkarıldı',
            permissionGroup: updatedPermissionGroup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzin gruptan çıkarılamadı',
            error: error.message
        });
    }
});
exports.removePermissionFromGroup = removePermissionFromGroup;
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
