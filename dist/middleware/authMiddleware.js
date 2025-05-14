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
exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// JWT token'ı doğrulama ve kullanıcıyı request'e ekleme
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // Authorization header'dan token'ı al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı ayıkla
            token = req.headers.authorization.split(' ')[1];
            // Token'ı doğrula
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'defaultsecret');
            // Kullanıcıyı bul ve request'e ekle (password olmadan)
            req.user = yield User_1.default.findById(decoded.id).select('-password');
            next();
        }
        catch (error) {
            console.error('Token doğrulama hatası:', error);
            res.status(401).json({
                success: false,
                message: 'Yetkilendirme başarısız, token geçersiz'
            });
        }
    }
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Yetkilendirme başarısız, token bulunamadı'
        });
    }
});
exports.protect = protect;
// Admin yetkisini kontrol etme
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            message: 'Bu işlem için admin yetkisi gerekiyor'
        });
    }
};
exports.admin = admin;
