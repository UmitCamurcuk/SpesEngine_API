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

// Slack webhook test et
export const testSlackWebhook = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const { webhookUrl, channel, username, iconEmoji } = req.body;
    
    if (!webhookUrl) {
      res.status(400).json({
        success: false,
        message: 'Webhook URL gerekli'
      });
      return;
    }

    // Test mesajı hazırla
    const testMessage = {
      channel: channel || '#general',
      username: username || 'SpesEngine',
      icon_emoji: iconEmoji || ':robot_face:',
      text: 'SpesEngine Slack entegrasyonu test mesajı! 🚀',
      attachments: [
        {
          color: 'good',
          fields: [
            {
              title: 'Test Sonucu',
              value: 'Slack webhook bağlantısı başarıyla çalışıyor!',
              short: false
            },
            {
              title: 'Zaman',
              value: new Date().toLocaleString('tr-TR'),
              short: true
            }
          ]
        }
      ]
    };

    // Slack'e mesaj gönder
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    if (response.ok) {
      res.json({
        success: true,
        message: 'Slack webhook test mesajı başarıyla gönderildi!'
      });
    } else {
      const errorText = await response.text();
      res.status(400).json({
        success: false,
        message: `Slack webhook hatası: ${response.status} - ${errorText}`
      });
    }
  } catch (error: any) {
    console.error('Slack webhook test hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Slack webhook test edilirken bir hata oluştu'
    });
  }
}; 