import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private static accessTokenSecret = process.env.JWT_SECRET!;
  private static refreshTokenSecret = process.env.JWT_SECRET! + '_refresh';
  private static accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
  private static refreshTokenExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

  // Access Token oluştur
  static generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'SpesEngine',
      audience: 'SpesEngine-Client'
    } as jwt.SignOptions);
  }

  // Refresh Token oluştur
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'SpesEngine',
      audience: 'SpesEngine-Client'
    } as jwt.SignOptions);
  }

  // Access Token doğrula
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'SpesEngine',
        audience: 'SpesEngine-Client'
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  // Refresh Token doğrula
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'SpesEngine',
        audience: 'SpesEngine-Client'
      }) as RefreshTokenPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Token'dan payload al (doğrulama yapmadan)
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  // Token'ın süresini kontrol et
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  // Token'ın süresini al
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}

export { TokenPayload, RefreshTokenPayload }; 