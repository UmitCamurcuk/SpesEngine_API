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
exports.logout = exports.getMe = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
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
// Kullanıcı girişi
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Email ve şifre kontrolü
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email ve şifre giriniz'
            });
            return;
        }
        // Kullanıcıyı kontrol et
        const user = yield User_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Geçersiz kimlik bilgileri'
            });
            return;
        }
        // Şifre kontrolü
        const isMatch = yield user.matchPassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Geçersiz kimlik bilgileri'
            });
            return;
        }
        // Token oluştur
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Giriş başarısız',
            error: error.message
        });
    }
});
exports.login = login;
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
    // Token oluştur
    const accessToken = user.getSignedJwtToken();
    // Refresh token için de bir token oluştur (yaşam süresi daha uzun olabilir)
    const refreshToken = user.getSignedJwtToken();
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
