import { Request, Response } from 'express';
import { Types } from 'mongoose';
import systemSettingsService from '../services/systemSettings.service';
import { IUser } from '../models/User';

// Request tipini genişlet
interface RequestWithUser extends Request {
  user?: IUser;
}

// Tüm ayarları getir
export const getSettings = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const settings = await systemSettingsService.getSettings();
    
    if (!settings) {
      if (!req.user?._id) {
        throw new Error('Kullanıcı kimliği bulunamadı');
      }
      // Ayarlar yoksa varsayılan ayarları oluştur
      const userId = new Types.ObjectId(req.user._id);
      const defaultSettings = await systemSettingsService.createDefaultSettings(userId);
      res.json({
        success: true,
        data: defaultSettings
      });
      return;
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Sistem ayarları getirilirken bir hata oluştu'
    });
  }
};

// Tüm ayarları güncelle
export const updateSettings = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      throw new Error('Kullanıcı kimliği bulunamadı');
    }
    const userId = new Types.ObjectId(req.user._id);
    const settings = await systemSettingsService.updateSettings(req.body, userId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Sistem ayarları güncellenirken bir hata oluştu'
    });
  }
};

// Belirli bir bölümü güncelle
export const updateSection = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      throw new Error('Kullanıcı kimliği bulunamadı');
    }
    const userId = new Types.ObjectId(req.user._id);
    const { section } = req.params;
    const settings = await systemSettingsService.updateSection(section, req.body, userId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Sistem ayarları bölümü güncellenirken bir hata oluştu'
    });
  }
};

// Logo güncelle
export const updateLogo = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      throw new Error('Kullanıcı kimliği bulunamadı');
    }
    const userId = new Types.ObjectId(req.user._id);
    const { logoUrl } = req.body;
    const settings = await systemSettingsService.updateLogo(logoUrl, userId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Logo güncellenirken bir hata oluştu'
    });
  }
}; 