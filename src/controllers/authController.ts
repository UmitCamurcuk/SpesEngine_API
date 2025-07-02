import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';
import Role from '../models/Role';
import jwt, { SignOptions } from 'jsonwebtoken';

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

    // Token oluştur
    const jwtOptions: SignOptions = { expiresIn: 86400 }; // 24 saat (saniye cinsinden)
    const accessToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET || 'default-secret-key',
      jwtOptions
    );

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
  // Token oluştur
  const accessToken = user.getSignedJwtToken();
  // Refresh token için de bir token oluştur (yaşam süresi daha uzun olabilir)
  const refreshToken = user.getSignedJwtToken();

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