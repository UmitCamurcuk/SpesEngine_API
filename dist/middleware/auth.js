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
    // OPTIONS istekleri için CORS ön kontrolü yapılıyor, hemen izin ver
    if (req.method === 'OPTIONS') {
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
        // Kullanıcıyı bul
        const user = yield User_1.default.findById(decoded.id);
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
// Rol bazlı yetkilendirme - basitleştirilmiş
const authorize = (...roles) => {
    return (req, res, next) => {
        // Şimdilik herkese izin ver
        next();
    };
};
exports.authorize = authorize;
// İzin kontrolü - basitleştirilmiş
const checkPermission = (permissionCode) => {
    return (req, res, next) => {
        // Şimdilik herkese izin ver
        next();
    };
};
exports.checkPermission = checkPermission;
