import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Kullanıcı tipini genişletmek için Express Request'i extend ediyoruz
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// JWT token'ı doğrulama ve kullanıcıyı request'e ekleme
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Authorization header'dan token'ı al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı ayıkla
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');

      // Kullanıcıyı bul ve request'e ekle (password olmadan)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
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
};

// Admin yetkisini kontrol etme
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Bu işlem için admin yetkisi gerekiyor' 
    });
  }
}; 