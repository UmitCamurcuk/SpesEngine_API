import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Role from '../models/Role';
import Permission from '../models/Permission';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar') as DecodedToken;

    // Kullanıcıyı bul ve rolü ile birlikte getir
    const user = await User.findById(decoded.id).populate({
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
  } catch (error) {
    res.status(401).json({ success: false, message: 'Geçersiz token' });
    return;
  }
};

// Rol bazlı yetkilendirme
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
    const populatedRole = userRole as unknown as { name: string };
    const hasRole = roles.some(role => populatedRole.name === role);

    if (!hasRole) {
      res.status(403).json({ success: false, message: 'Bu kaynağa erişmek için gerekli role sahip değilsiniz' });
      return;
    }

    next();
  };
};

// İzin kontrolü
export const checkPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
      const populatedRole = userRole as unknown as { permissions: { code: string }[] };
      
      // Kullanıcının izinleri içinde istenen izin kodu var mı kontrol ediyoruz
      const hasPermission = populatedRole.permissions.some(
        permission => permission.code === permissionCode
      );

      if (!hasPermission) {
        res.status(403).json({ success: false, message: 'Bu kaynağa erişmek için gerekli izinlere sahip değilsiniz' });
        return;
      }

      next();
    } catch (error) {
      console.error('İzin kontrolü sırasında hata:', error);
      res.status(500).json({ success: false, message: 'Sunucu hatası: İzinler kontrol edilirken bir hata oluştu' });
    }
  };
};