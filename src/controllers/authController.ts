import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

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

// Kullanıcı girişi
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email ve şifre giriniz'
      });
      return;
    }

    // Kullanıcıyı kontrol et
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz kimlik bilgileri'
      });
      return;
    }

    // Şifre kontrolü
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz kimlik bilgileri'
      });
      return;
    }

    // Token oluştur
    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Giriş başarısız',
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