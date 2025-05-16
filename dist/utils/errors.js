"use strict";
// Custom hata sınıfları
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.ConflictError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.NotFoundError = exports.ApplicationError = void 0;
/**
 * Uygulama temelli hata sınıfı
 */
class ApplicationError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationError = ApplicationError;
/**
 * 404 Not Found hatası
 */
class NotFoundError extends ApplicationError {
    constructor(message = 'Kaynak bulunamadı') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 400 Bad Request - Doğrulama hatası
 */
class ValidationError extends ApplicationError {
    constructor(message = 'Doğrulama hatası', details) {
        super(message, 400);
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
/**
 * 401 Unauthorized - Kimlik doğrulama hatası
 */
class AuthenticationError extends ApplicationError {
    constructor(message = 'Kimlik doğrulama hatası') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * 403 Forbidden - Yetkilendirme hatası
 */
class AuthorizationError extends ApplicationError {
    constructor(message = 'Bu işlem için yetkiniz yok') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * 409 Conflict - Çakışma hatası
 */
class ConflictError extends ApplicationError {
    constructor(message = 'Kaynak çakışması') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
/**
 * 500 Server Error - Sunucu hatası
 */
class ServerError extends ApplicationError {
    constructor(message = 'Sunucu hatası') {
        super(message, 500);
    }
}
exports.ServerError = ServerError;
