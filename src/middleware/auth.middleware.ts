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

// JWT token'ını doğrula ve kullanıcıyı yükle
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  // Lokalizasyon rotalarını atla
  if (req.path.includes('localizations')) {
    next();
    return;
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Yetkilendirme token\'ı bulunamadı'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as DecodedToken;
    const user = await User.findById(decoded.id)
      .populate({
        path: 'role',
        populate: [
          {
            path: 'permissionGroups.permissionGroup',
            select: 'name code description'
          },
          {
            path: 'permissionGroups.permissions.permission',
            select: 'name description code'
          }
        ]
      })
      .select('-password');
    
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return res.status(403).json({
      success: false,
      error: 'Geçersiz veya süresi dolmuş token'
    });
  }
};

// Rol ve izin kontrolü
export const checkAccess = (requiredPermissions: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Bu kaynağa erişim için yetkiniz yok' 
      });
    }

    try {
      const userRole = req.user.role as any; // Tip dönüşümü için
      
      // Yeni yapıya göre kullanıcının permission'larını topla
      const userPermissions: string[] = [];
      
      if (userRole.permissionGroups && Array.isArray(userRole.permissionGroups)) {
        for (const permissionGroup of userRole.permissionGroups) {
          if (permissionGroup.permissions && Array.isArray(permissionGroup.permissions)) {
            for (const permissionItem of permissionGroup.permissions) {
              // Sadece granted:true olan permission'ları ekle
              if (permissionItem.granted && permissionItem.permission && permissionItem.permission.code) {
                userPermissions.push(permissionItem.permission.code);
              }
            }
          }
        }
      }
      // İzin kontrolü
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          return res.status(403).json({ 
            success: false, 
            message: 'Bu kaynağa erişmek için gerekli izinlere sahip değilsiniz' 
          });
        }
      }

      next();
    } catch (error) {
      console.error('Yetki kontrolü sırasında hata:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Sunucu hatası: Yetkiler kontrol edilirken bir hata oluştu' 
      });
    }
  };
}; 