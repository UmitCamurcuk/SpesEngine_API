import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface DecodedToken {
  id: string;
}

// Kullanıcı tipini genişletme
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Kimlik doğrulama middleware
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar') as DecodedToken;

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
      return;
    }

    // Kullanıcıyı request nesnesine ekle
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Geçersiz token' });
    return;
  }
};

// Rol bazlı yetkilendirme - basitleştirilmiş
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Şimdilik herkese izin ver
    next();
  };
};

// İzin kontrolü - basitleştirilmiş
export const checkPermission = (permissionCode: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Şimdilik herkese izin ver
    next();
  };
};