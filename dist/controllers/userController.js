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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.removeRoleFromUser = exports.assignRoleToUser = exports.getUsersNotInRole = exports.getUsersByRole = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Role_1 = __importDefault(require("../models/Role"));
const permissionVersionService_1 = require("../services/permissionVersionService");
// Tüm kullanıcıları getir
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const users = yield User_1.default.find(query)
            .populate('role', 'name description')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = yield User_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            count: users.length,
            total,
            users: users,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar getirilemedi',
            error: error.message
        });
    }
});
exports.getUsers = getUsers;
// Belirli bir role atanmış kullanıcıları getir
const getUsersByRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        // Role'ün var olup olmadığını kontrol et
        const role = yield Role_1.default.findById(roleId);
        if (!role) {
            res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
            return;
        }
        const users = yield User_1.default.find({ role: roleId })
            .populate('role', 'name description')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            users: users,
            role: {
                _id: role._id,
                name: role.name,
                description: role.description
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Role kullanıcıları getirilemedi',
            error: error.message
        });
    }
});
exports.getUsersByRole = getUsersByRole;
// Belirli bir role atanmamış kullanıcıları getir
const getUsersNotInRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        // Role'ün var olup olmadığını kontrol et
        const role = yield Role_1.default.findById(roleId);
        if (!role) {
            res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
            return;
        }
        const users = yield User_1.default.find({
            role: { $ne: roleId },
            isActive: true // Sadece aktif kullanıcıları göster
        })
            .populate('role', 'name description')
            .sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: users.length,
            users: users,
            role: {
                _id: role._id,
                name: role.name,
                description: role.description
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanılabilir kullanıcılar getirilemedi',
            error: error.message
        });
    }
});
exports.getUsersNotInRole = getUsersNotInRole;
// Kullanıcıya rol ata
const assignRoleToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { roleId, comment } = req.body;
        // Kullanıcıyı kontrol et
        const user = yield User_1.default.findById(userId).populate('role');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        // Role'ü kontrol et
        const role = yield Role_1.default.findById(roleId);
        if (!role) {
            res.status(404).json({
                success: false,
                message: 'Rol bulunamadı'
            });
            return;
        }
        // Kullanıcının zaten bu role sahip olup olmadığını kontrol et
        if (user.role && user.role._id.toString() === roleId) {
            res.status(400).json({
                success: false,
                message: 'Kullanıcı zaten bu role sahip'
            });
            return;
        }
        const previousRole = user.role;
        // Kullanıcıya yeni rolü ata
        user.role = roleId;
        yield user.save();
        // Güncellenen kullanıcıyı populate et
        yield user.populate('role');
        // Kullanıcının permission version'ını güncelle
        try {
            yield permissionVersionService_1.PermissionVersionService.invalidateUserPermissions(userId);
            console.log(`Permission version updated for user: ${userId}`);
        }
        catch (permissionError) {
            console.error('Permission version güncelleme hatası:', permissionError);
            // Permission version hatası ana işlemi durdurmaz
        }
        res.status(200).json({
            success: true,
            message: 'Kullanıcıya rol başarıyla atandı',
            user: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Rol atama işlemi başarısız',
            error: error.message
        });
    }
});
exports.assignRoleToUser = assignRoleToUser;
// Kullanıcıdan rol kaldır
const removeRoleFromUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, roleId } = req.params;
        const { comment } = req.body;
        // Kullanıcıyı kontrol et
        const user = yield User_1.default.findById(userId).populate('role');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        // Kullanıcının bu role sahip olup olmadığını kontrol et
        if (!user.role || user.role._id.toString() !== roleId) {
            res.status(400).json({
                success: false,
                message: 'Kullanıcı bu role sahip değil'
            });
            return;
        }
        const previousRole = user.role;
        // Varsayılan bir rol bulalım (örneğin "User" rolü)
        const defaultRole = yield Role_1.default.findOne({ name: 'User' });
        if (!defaultRole) {
            res.status(500).json({
                success: false,
                message: 'Varsayılan rol bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.'
            });
            return;
        }
        // Kullanıcıya varsayılan rolü ata
        user.role = defaultRole._id;
        yield user.save();
        // Güncellenen kullanıcıyı populate et
        yield user.populate('role');
        // Kullanıcının permission version'ını güncelle
        try {
            yield permissionVersionService_1.PermissionVersionService.invalidateUserPermissions(userId);
            console.log(`Permission version updated for user: ${userId}`);
        }
        catch (permissionError) {
            console.error('Permission version güncelleme hatası:', permissionError);
            // Permission version hatası ana işlemi durdurmaz
        }
        res.status(200).json({
            success: true,
            message: 'Kullanıcı rolü başarıyla kaldırıldı',
            user: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Rol kaldırma işlemi başarısız',
            error: error.message
        });
    }
});
exports.removeRoleFromUser = removeRoleFromUser;
// Tek bir kullanıcıyı getir
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).populate('role');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcı getirilemedi',
            error: error.message
        });
    }
});
exports.getUser = getUser;
// Kullanıcı oluştur
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kullanıcı oluşturulamadı',
            error: error.message
        });
    }
});
exports.createUser = createUser;
// Kullanıcı güncelle
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kullanıcı güncellenemedi',
            error: error.message
        });
    }
});
exports.updateUser = updateUser;
// Kullanıcı sil
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinemedi',
            error: error.message
        });
    }
});
exports.deleteUser = deleteUser;
