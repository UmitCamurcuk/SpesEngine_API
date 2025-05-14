import { Request, Response } from 'express';
import User, { IUser } from '../models/User';

// Tüm kullanıcıları getir
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().populate('role');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilemedi',
      error: error.message
    });
  }
};

// Tek bir kullanıcıyı getir
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate('role');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı getirilemedi',
      error: error.message
    });
  }
};

// Kullanıcı oluştur
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Kullanıcı oluşturulamadı',
      error: error.message
    });
  }
};

// Kullanıcı güncelle
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Kullanıcı güncellenemedi',
      error: error.message
    });
  }
};

// Kullanıcı sil
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinemedi',
      error: error.message
    });
  }
}; 