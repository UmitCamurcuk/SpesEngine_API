import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';
import Role from '../models/Role';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTService } from '../utils/jwt';

// Kullanıcının izinlerini topla
const getUserPermissions = async (user: any): Promise<string[]> => {
  const permissions: string[] = [];
  
  if (user.isAdmin) {
    return ['*']; // Admin tüm izinlere sahip
  }
  
  if (user.role && user.role.permissionGroups) {
    for (const group of user.role.permissionGroups) {
      if (group.permissions) {
        for (const perm of group.permissions) {
          if (perm.granted && perm.permission && perm.permission.code) {
            permissions.push(perm.permission.code);
          }
        }
      }
    }
  }
  
  return permissions;
};

// Kullanıcı kaydı
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Geçici olarak sabit bir rol ID'si oluştur
    const roleId = new mongoose.Types.ObjectId();

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password,
      role: roleId // Geçici rol ID'si
    });

    // Token oluştur
    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Kullanıcı kaydı başarısız',
      error: error.message
    });
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen email ve şifre giriniz'
      });
    }

    // Kullanıcıyı bul ve role bilgilerini populate et
    const user = await User.findOne({ email })
      .select('+password')
      .populate({
        path: 'role',
        populate: {
          path: 'permissionGroups',
          populate: [
            {
              path: 'permissionGroup',
              select: 'name code description'
            },
            {
              path: 'permissions.permission',
              select: 'name description code'
            }
          ]
        }
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // Şifre kontrolü
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
    }

    // İzinleri topla
    const permissions = await getUserPermissions(user);

    // Access token oluştur
    const accessToken = JWTService.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: (user.role as any)?.name || 'user',
      permissions,
      permissionVersion: user.permissionVersion || 0
    });

    // Refresh token oluştur
    const refreshToken = JWTService.generateRefreshToken({
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion
    });

    // User nesnesini düz objeye çevir ve password'ü çıkar
    const userObject: any = user.toObject();
    delete userObject.password;

    // Admin kullanıcısı için özel durum
    if (userObject.isAdmin && (!userObject.role || !userObject.role.permissionGroups)) {
      userObject.role = {
        _id: 'admin',
        name: 'System Admin',
        description: 'System Administrator with all permissions',
        permissionGroups: [{
          permissionGroup: {
            _id: 'admin',
            name: 'All Permissions',
            code: '*',
            description: 'All system permissions'
          },
          permissions: [{
            permission: {
              _id: 'admin',
              name: { tr: 'Tüm İzinler', en: 'All Permissions' },
              code: '*',
              description: { tr: 'Tüm sistem izinleri', en: 'All system permissions' }
            },
            granted: true
          }]
        }],
        isActive: true
      };
    }

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: userObject
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Giriş yapılamadı',
      error: error.message
    });
  }
};

// @desc    Token yenileme
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token bulunamadı'
      });
    }

    // Refresh token'ı doğrula
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    // Kullanıcıyı bul ve token sürümünü kontrol et
    const user = await User.findById(decoded.userId)
      .populate({
        path: 'role',
        populate: {
          path: 'permissionGroups',
          populate: [
            {
              path: 'permissionGroup',
              select: 'name code description'
            },
            {
              path: 'permissions.permission',
              select: 'name description code'
            }
          ]
        }
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Token sürümünü kontrol et
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Token sürümü geçersiz - yeniden giriş yapınız'
      });
    }

    // İzinleri topla
    const permissions = await getUserPermissions(user);

    // Yeni access token oluştur
    const newAccessToken = JWTService.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: (user.role as any)?.name || 'user',
      permissions,
      permissionVersion: user.permissionVersion || 0
    });

    // Yeni refresh token oluştur
    const newRefreshToken = JWTService.generateRefreshToken({
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz refresh token',
      error: error.message
    });
  }
};

// Mevcut kullanıcıyı getir
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri getirilemedi',
      error: error.message
    });
  }
};

// Çıkış yap
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Token oluştur ve cookie olarak gönder
const sendTokenResponse = (user: IUser, statusCode: number, res: Response): void => {
  // Access token oluştur (kısa süreli)
  const accessTokenOptions: SignOptions = { expiresIn: '1d' };
  const accessToken = jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET || 'default-secret-key',
    accessTokenOptions
  );

  // Refresh token oluştur (uzun süreli)
  const refreshTokenOptions: SignOptions = { expiresIn: '7d' };
  const refreshToken = jwt.sign(
    { id: user._id.toString(), type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key',
    refreshTokenOptions
  );

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE ? 
        parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      role: 'user'
    }
  });
};

// @desc    Kullanıcı izinlerini yenile
// @route   GET /api/auth/refresh-permissions
// @access  Private
export const refreshPermissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcıyı tüm izin bilgileriyle birlikte yeniden çek
    const updatedUser = await User.findById(req.user._id)
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

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'İzinler yenilenemedi',
      error: error.message
    });
  }
}; 