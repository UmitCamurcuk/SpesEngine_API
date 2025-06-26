import SystemSettings, { ISystemSettings } from '../models/SystemSettings';
import History, { IHistory } from '../models/History';

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'slack' | 'whatsapp' | 'email' | 'webhook';
  isEnabled: boolean;
  settings: any;
  priority: number;
}

export interface NotificationMessage {
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  changes?: string[];
  comment?: string;
}

class NotificationService {
  /**
   * Sistemde aktif olan bildirim kanallarını getir
   */
  private async getActiveChannels(): Promise<NotificationChannel[]> {
    try {
      const systemSettings = await SystemSettings.findOne();
      if (!systemSettings?.integrations) {
        return [];
      }

      const channels: NotificationChannel[] = [];

      // Slack entegrasyonu
      if (systemSettings.integrations.slack?.enabled && systemSettings.integrations.slack?.webhookUrl) {
        channels.push({
          id: 'slack',
          name: 'Slack',
          type: 'slack',
          isEnabled: true,
          settings: systemSettings.integrations.slack,
          priority: 1
        });
      }

      // WhatsApp entegrasyonu (gelecek için hazır - şimdilik devre dışı)
      // if (systemSettings.integrations.whatsapp?.enabled && systemSettings.integrations.whatsapp?.apiKey) {
      //   channels.push({
      //     id: 'whatsapp',
      //     name: 'WhatsApp',
      //     type: 'whatsapp',
      //     isEnabled: true,
      //     settings: systemSettings.integrations.whatsapp,
      //     priority: 2
      //   });
      // }

      // Email entegrasyonu (gelecek için hazır - şimdilik devre dışı)
      // if (systemSettings.integrations.email?.enabled && systemSettings.integrations.email?.smtpSettings) {
      //   channels.push({
      //     id: 'email',
      //     name: 'Email',
      //     type: 'email',
      //     isEnabled: true,
      //     settings: systemSettings.integrations.email,
      //     priority: 3
      //   });
      // }

      // Custom webhook entegrasyonu (gelecek için hazır - şimdilik devre dışı)
      // if (systemSettings.integrations.webhook?.enabled && systemSettings.integrations.webhook?.url) {
      //   channels.push({
      //     id: 'webhook',
      //     name: 'Custom Webhook',
      //     type: 'webhook',
      //     isEnabled: true,
      //     settings: systemSettings.integrations.webhook,
      //     priority: 4
      //   });
      // }

      // Priority'ye göre sırala
      return channels.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      console.error('Error getting active channels:', error);
      return [];
    }
  }

  /**
   * Mesaj formatını hazırla
   */
  private formatMessage(message: NotificationMessage): string {
    const { title, entityType, entityName, action, userName, changes, comment, timestamp } = message;
    
    let formattedMessage = `🔔 *${title}*\n\n`;
    formattedMessage += `📋 **Entity:** ${entityType}\n`;
    formattedMessage += `📝 **Name:** ${entityName}\n`;
    formattedMessage += `⚡ **Action:** ${action}\n`;
    
    if (userName) {
      formattedMessage += `👤 **User:** ${userName}\n`;
    }
    
    formattedMessage += `🕐 **Time:** ${timestamp.toLocaleString('tr-TR')}\n`;

    if (changes && changes.length > 0) {
      formattedMessage += `\n📊 **Changes:**\n`;
      changes.forEach(change => {
        formattedMessage += `• ${change}\n`;
      });
    }

    if (comment) {
      formattedMessage += `\n💬 **Comment:** ${comment}\n`;
    }

    return formattedMessage;
  }

  /**
   * Slack'a mesaj gönder
   */
  private async sendToSlack(channel: NotificationChannel, message: NotificationMessage): Promise<boolean> {
    try {
      const webhookUrl = channel.settings.webhookUrl;
      const formattedMessage = this.formatMessage(message);

      const payload = {
        text: formattedMessage,
        username: 'SpesEngine Bot',
        icon_emoji: ':gear:',
        channel: channel.settings.channel || '#general'
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending to Slack:', error);
      return false;
    }
  }

  /**
   * WhatsApp'a mesaj gönder (gelecek için placeholder)
   */
  private async sendToWhatsApp(channel: NotificationChannel, message: NotificationMessage): Promise<boolean> {
    try {
      // WhatsApp API entegrasyonu burada implement edilecek
      console.log('WhatsApp integration not implemented yet');
      return true;
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      return false;
    }
  }

  /**
   * Email gönder (gelecek için placeholder)
   */
  private async sendToEmail(channel: NotificationChannel, message: NotificationMessage): Promise<boolean> {
    try {
      // Email entegrasyonu burada implement edilecek
      console.log('Email integration not implemented yet');
      return true;
    } catch (error) {
      console.error('Error sending to Email:', error);
      return false;
    }
  }

  /**
   * Custom webhook'a mesaj gönder (gelecek için placeholder)
   */
  private async sendToWebhook(channel: NotificationChannel, message: NotificationMessage): Promise<boolean> {
    try {
      // Custom webhook entegrasyonu burada implement edilecek
      console.log('Webhook integration not implemented yet');
      return true;
    } catch (error) {
      console.error('Error sending to Webhook:', error);
      return false;
    }
  }

  /**
   * Belirli bir kanala mesaj gönder
   */
  private async sendToChannel(channel: NotificationChannel, message: NotificationMessage): Promise<boolean> {
    switch (channel.type) {
      case 'slack':
        return await this.sendToSlack(channel, message);
      case 'whatsapp':
        return await this.sendToWhatsApp(channel, message);
      case 'email':
        return await this.sendToEmail(channel, message);
      case 'webhook':
        return await this.sendToWebhook(channel, message);
      default:
        console.warn(`Unknown channel type: ${channel.type}`);
        return false;
    }
  }

  /**
   * Tüm aktif kanallara bildirim gönder
   */
  public async sendNotification(message: NotificationMessage): Promise<{
    success: boolean;
    results: { channelId: string; channelName: string; success: boolean; error?: string }[];
  }> {
    const channels = await this.getActiveChannels();
    
    if (channels.length === 0) {
      console.log('No active notification channels found');
      return {
        success: false,
        results: []
      };
    }

    const results = await Promise.allSettled(
      channels.map(async (channel) => {
        const success = await this.sendToChannel(channel, message);
        return {
          channelId: channel.id,
          channelName: channel.name,
          success
        };
      })
    );

    const finalResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          channelId: channels[index].id,
          channelName: channels[index].name,
          success: false,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    const overallSuccess = finalResults.some(result => result.success);

    console.log('Notification results:', finalResults);

    return {
      success: overallSuccess,
      results: finalResults
    };
  }

  /**
   * Entity güncellendiğinde bildirim gönder
   */
  public async sendEntityUpdateNotification(
    entityType: string,
    entityId: string,
    entityName: string,
    changes: string[],
    comment?: string,
    userId?: string,
    userName?: string
  ): Promise<void> {
    const message: NotificationMessage = {
      title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Güncellendi`,
      message: `${entityName} ${entityType} güncellenmiştir.`,
      entityType,
      entityId,
      entityName,
      action: 'UPDATE',
      timestamp: new Date(),
      userId,
      userName,
      changes,
      comment
    };

    await this.sendNotification(message);
  }

  /**
   * Entity silindiğinde bildirim gönder
   */
  public async sendEntityDeleteNotification(
    entityType: string,
    entityId: string,
    entityName: string,
    userId?: string,
    userName?: string
  ): Promise<void> {
    const message: NotificationMessage = {
      title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Silindi`,
      message: `${entityName} ${entityType} silinmiştir.`,
      entityType,
      entityId,
      entityName,
      action: 'DELETE',
      timestamp: new Date(),
      userId,
      userName
    };

    await this.sendNotification(message);
  }

  /**
   * Entity kullanıldığında bildirim gönder
   */
  public async sendEntityUsageNotification(
    sourceEntityType: string,
    sourceEntityId: string,
    sourceEntityName: string,
    targetEntityType: string,
    targetEntityName: string,
    userId?: string,
    userName?: string
  ): Promise<void> {
    const message: NotificationMessage = {
      title: `${sourceEntityType.charAt(0).toUpperCase() + sourceEntityType.slice(1)} Kullanıldı`,
      message: `${sourceEntityName} ${sourceEntityType} artık ${targetEntityName} ${targetEntityType} içinde kullanılıyor.`,
      entityType: sourceEntityType,
      entityId: sourceEntityId,
      entityName: sourceEntityName,
      action: 'USAGE',
      timestamp: new Date(),
      userId,
      userName,
      changes: [`${targetEntityType} içinde kullanım: ${targetEntityName}`]
    };

    await this.sendNotification(message);
  }
}

export default new NotificationService(); 