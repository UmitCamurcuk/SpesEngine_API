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
exports.refreshPermissions = exports.logout = exports.getMe = exports.refreshToken = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Kullanıcı kaydı
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        // Geçici olarak sabit bir rol ID'si oluştur
        const roleId = new mongoose_1.default.Types.ObjectId();
        // Kullanıcı oluştur
        const user = yield User_1.default.create({
            name,
            email,
            password,
            role: roleId // Geçici rol ID'si
        });
        // Token oluştur
        sendTokenResponse(user, 201, res);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kullanıcı kaydı başarısız',
            error: error.message
        });
    }
});
exports.register = register;
// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Email ve şifre kontrolü
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen email ve şifre giriniz'
            });
        }
        // Kullanıcıyı bul ve role bilgilerini populate et
        const user = yield User_1.default.findOne({ email })
            .select('+password')
            .populate({
            path: 'role',
            populate: {
                path: 'permissionGroups',
                populate: [
                    {
                        path: 'permissionGroup',
                        select: 'name code description'
                    },
                    {
                        path: 'permissions.permission',
                        select: 'name description code'
                    }
                ]
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }
        // Şifre kontrolü
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }
        // Access token oluştur (kısa süreli)
        const accessTokenOptions = { expiresIn: '15m' }; // 15 dakika
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'default-secret-key', accessTokenOptions);
        // Refresh token oluştur (uzun süreli)
        const refreshTokenOptions = { expiresIn: '7d' }; // 7 gün
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id.toString(), type: 'refresh' }, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key', refreshTokenOptions);
        // User nesnesini düz objeye çevir ve password'ü çıkar
        const userObject = user.toObject();
        delete userObject.password;
        // Admin kullanıcısı için özel durum
        if (userObject.isAdmin && (!userObject.role || !userObject.role.permissionGroups)) {
            userObject.role = {
                _id: 'admin',
                name: 'System Admin',
                description: 'System Administrator with all permissions',
                permissionGroups: [{
                        permissionGroup: {
                            _id: 'admin',
                            name: 'All Permissions',
                            code: '*',
                            description: 'All system permissions'
                        },
                        permissions: [{
                                permission: {
                                    _id: 'admin',
                                    name: { tr: 'Tüm İzinler', en: 'All Permissions' },
                                    code: '*',
                                    description: { tr: 'Tüm sistem izinleri', en: 'All system permissions' }
                                },
                                granted: true
                            }]
                    }],
                isActive: true
            };
        }
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: userObject
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Giriş yapılamadı',
            error: error.message
        });
    }
});
exports.login = login;
// @desc    Token yenileme
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token bulunamadı'
            });
        }
        // Refresh token'ı doğrula
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key');
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz refresh token'
            });
        }
        // Kullanıcıyı bul
        const user = yield User_1.default.findById(decoded.id)
            .populate({
            path: 'role',
            populate: {
                path: 'permissionGroups',
                populate: [
                    {
                        path: 'permissionGroup',
                        select: 'name code description'
                    },
                    {
                        path: 'permissions.permission',
                        select: 'name description code'
                    }
                ]
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }
        // Yeni access token oluştur
        const accessTokenOptions = { expiresIn: '15m' };
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'default-secret-key', accessTokenOptions);
        // Yeni refresh token oluştur
        const refreshTokenOptions = { expiresIn: '7d' };
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user._id.toString(), type: 'refresh' }, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key', refreshTokenOptions);
        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Geçersiz refresh token',
            error: error.message
        });
    }
});
exports.refreshToken = refreshToken;
// Mevcut kullanıcıyı getir
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgileri getirilemedi',
            error: error.message
        });
    }
});
exports.getMe = getMe;
// Çıkış yap
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        success: true,
        data: {}
    });
});
exports.logout = logout;
// Token oluştur ve cookie olarak gönder
const sendTokenResponse = (user, statusCode, res) => {
    // Access token oluştur (kısa süreli)
    const accessTokenOptions = { expiresIn: '15m' };
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'default-secret-key', accessTokenOptions);
    // Refresh token oluştur (uzun süreli)
    const refreshTokenOptions = { expiresIn: '7d' };
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id.toString(), type: 'refresh' }, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key', refreshTokenOptions);
    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE ?
            parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };
    res.status(statusCode).json({
        success: true,
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            email: user.email,
            firstName: user.name.split(' ')[0],
            lastName: user.name.split(' ').slice(1).join(' '),
            role: 'user'
        }
    });
};
// @desc    Kullanıcı izinlerini yenile
// @route   GET /api/auth/refresh-permissions
// @access  Private
const refreshPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }
        // Kullanıcıyı tüm izin bilgileriyle birlikte yeniden çek
        const updatedUser = yield User_1.default.findById(req.user._id)
            .populate({
            path: 'role',
            populate: [
                {
                    path: 'permissionGroups.permissionGroup',
                    select: 'name code description'
                },
                {
                    path: 'permissionGroups.permissions.permission',
                    select: 'name description code'
                }
            ]
        })
            .select('-password');
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }
        res.status(200).json({
            success: true,
            user: updatedUser
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'İzinler yenilenemedi',
            error: error.message
        });
    }
});
exports.refreshPermissions = refreshPermissions;
