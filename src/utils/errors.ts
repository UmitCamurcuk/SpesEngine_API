// Custom hata sınıfları

/**
 * Uygulama temelli hata sınıfı
 */
export class ApplicationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found hatası
 */
export class NotFoundError extends ApplicationError {
  constructor(message: string = 'Kaynak bulunamadı') {
    super(message, 404);
  }
}

/**
 * 400 Bad Request - Doğrulama hatası
 */
export class ValidationError extends ApplicationError {
  details?: any;
  
  constructor(message: string = 'Doğrulama hatası', details?: any) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * 401 Unauthorized - Kimlik doğrulama hatası
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Kimlik doğrulama hatası') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Yetkilendirme hatası
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Bu işlem için yetkiniz yok') {
    super(message, 403);
  }
}

/**
 * 409 Conflict - Çakışma hatası
 */
export class ConflictError extends ApplicationError {
  constructor(message: string = 'Kaynak çakışması') {
    super(message, 409);
  }
}

/**
 * 500 Server Error - Sunucu hatası
 */
export class ServerError extends ApplicationError {
  constructor(message: string = 'Sunucu hatası') {
    super(message, 500);
  }
} 