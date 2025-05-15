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
exports.checkPermission = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Kimlik doğrulama middleware
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Lokalizasyon API'si için atlama
    if (req.originalUrl.includes('/api/localizations')) {
        next();
        return;
    }
    // OPTIONS istekleri için CORS ön kontrolü yapılıyor, hemen izin ver
    if (req.method === 'OPTIONS') {
        next();
        return;
    }
    // Geliştirme ortamında yetkilendirmeyi geçici olarak atla
    if (process.env.NODE_ENV === 'development') {
        next();
        return;
    }
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        res.status(401).json({ success: false, message: 'Bu kaynağa erişim için yetkiniz yok' });
        return;
    }
    try {
        // Token doğrulama
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'gizli_anahtar');
        // Kullanıcıyı bul ve rolü ile birlikte getir
        const user = yield User_1.default.findById(decoded.id).populate({
            path: 'role',
            select: 'name permissions',
            populate: {
                path: 'permissions',
                select: 'name code'
            }
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
            return;
        }
        // Kullanıcıyı request nesnesine ekle
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Geçersiz token' });
        return;
    }
});
exports.protect = protect;
// Rol bazlı yetkilendirme
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Bu kaynağa erişim için yetkiniz yok' });
            return;
        }
        // Kullanıcının rolü var mı kontrol ediyoruz
        const userRole = req.user.role;
        if (!userRole) {
            res.status(403).json({ success: false, message: 'Bu kaynağa erişmek için gerekli role sahip değilsiniz' });
            return;
        }
        // Admin ise her şeye erişim sağlar
        if (req.user.isAdmin) {
            next();
            return;
        }
        // Popülasyon sonrası role tipini düzeltmek için tip dönüşümü kullanıyoruz
        const populatedRole = userRole;
        const hasRole = roles.some(role => populatedRole.name === role);
        if (!hasRole) {
            res.status(403).json({ success: false, message: 'Bu kaynağa erişmek için gerekli role sahip değilsiniz' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// İzin kontrolü
const checkPermission = (permissionCode) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Bu kaynağa erişim için yetkiniz yok' });
            return;
        }
        // Admin ise her şeye erişim sağlar
        if (req.user.isAdmin) {
            next();
            return;
        }
        // Kullanıcının rolü var mı kontrol ediyoruz
        const userRole = req.user.role;
        if (!userRole) {
            res.status(403).json({ success: false, message: 'Bu kaynağa erişmek için gerekli izinlere sahip değilsiniz' });
            return;
        }
        try {
            // Populate işlemi daha önce yapılmış olmalı, tipini düzeltiyoruz
            const populatedRole = userRole;
            // Kullanıcının izinleri içinde istenen izin kodu var mı kontrol ediyoruz
            const hasPermission = populatedRole.permissions.some(permission => permission.code === permissionCode);
            if (!hasPermission) {
                res.status(403).json({ success: false, message: 'Bu kaynağa erişmek için gerekli izinlere sahip değilsiniz' });
                return;
            }
            next();
        }
        catch (error) {
            console.error('İzin kontrolü sırasında hata:', error);
            res.status(500).json({ success: false, message: 'Sunucu hatası: İzinler kontrol edilirken bir hata oluştu' });
        }
    });
};
exports.checkPermission = checkPermission;
