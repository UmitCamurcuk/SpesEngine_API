import SystemSettings, { ISystemSettings } from '../models/SystemSettings';
import { Types } from 'mongoose';

class SystemSettingsService {
  // Sistem ayarlarını getir
  async getSettings(): Promise<ISystemSettings | null> {
    return SystemSettings.findOne();
  }

  // Sistem ayarlarını güncelle
  async updateSettings(settings: Partial<ISystemSettings>, userId: Types.ObjectId): Promise<ISystemSettings> {
    const existingSettings = await SystemSettings.findOne();

    if (existingSettings) {
      // Mevcut ayarları güncelle
      Object.assign(existingSettings, settings);
      existingSettings.updatedBy = userId;
      return existingSettings.save();
    } else {
      // Yeni ayar kaydı oluştur
      const newSettings = new SystemSettings({
        ...settings,
        updatedBy: userId
      });
      return newSettings.save();
    }
  }

  // Belirli bir bölümü güncelle
  async updateSection(section: string, data: any, userId: Types.ObjectId): Promise<ISystemSettings> {
    const existingSettings = await SystemSettings.findOne();
    console.log(existingSettings);  
    if (existingSettings) {
      // Genel ayarlar için özel işlem
      if (section === 'general') {
        Object.assign(existingSettings, data);
      } else {
        // Diğer bölümler için alt obje güncelleme
        existingSettings[section] = {
          ...existingSettings[section],
          ...data
        };
      }
      
      existingSettings.updatedBy = userId;
      existingSettings.updatedAt = new Date();
      
      return existingSettings.save();
    } else {
      // Yeni ayar kaydı oluştur
      const newSettings = new SystemSettings({
        [section]: data,
        updatedBy: userId,
        updatedAt: new Date()
      });
      return newSettings.save();
    }
  }

  // Logo URL'sini güncelle
  async updateLogo(logoUrl: string, userId: Types.ObjectId): Promise<ISystemSettings> {
    const settings = await SystemSettings.findOne();
    
    if (!settings) {
      const newSettings = new SystemSettings({
        logoUrl,
        updatedBy: userId
      });
      return newSettings.save();
    }

    settings.logoUrl = logoUrl;
    settings.updatedBy = userId;
    return settings.save();
  }

  // Varsayılan ayarları oluştur
  async createDefaultSettings(userId: Types.ObjectId): Promise<ISystemSettings> {
    const existingSettings = await SystemSettings.findOne();
    if (existingSettings) {
      return existingSettings;
    }

    const defaultSettings = new SystemSettings({
      updatedBy: userId
    });
    return defaultSettings.save();
  }
}

export default new SystemSettingsService(); 