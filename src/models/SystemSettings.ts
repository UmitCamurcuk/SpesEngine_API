import mongoose, { Schema, Document } from 'mongoose';

// Sistem ayarları için interface
export interface ISystemSettings extends Document {
  // Genel Ayarlar
  companyName: string;
  systemTitle: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  logoUrl: string;

  // Tema Ayarları
  theme: {
    mode: 'light' | 'dark' | 'system' | 'custom';
    enableDarkMode: boolean;
    defaultDarkMode: boolean;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    enableCustomFonts: boolean;
    customFont: string;
    customLogoUrl: string;
    enableCustomStyles: boolean;
    customCSS: string;
    showLogo: boolean;
    showUserAvatar: boolean;
    menuStyle: 'side' | 'top';
  };

  // Güvenlik Ayarları
  security: {
    passwordPolicy: 'basic' | 'medium' | 'strong' | 'very_strong';
    passwordExpiryDays: number;
    loginAttempts: number;
    sessionTimeout: number;
    allowedIPs: string[];
    enableTwoFactor: boolean;
  };

  // Bildirim Ayarları
  notifications: {
    enableSystemNotifications: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    notifyUserOnLogin: boolean;
    notifyUserOnPasswordChange: boolean;
    notifyUserOnRoleChange: boolean;
    notifyOnDataImport: boolean;
    notifyOnDataExport: boolean;
    notifyOnBulkChanges: boolean;
    notifyOnSystemUpdates: boolean;
    notifyOnBackupComplete: boolean;
    notifyOnSystemErrors: boolean;
    adminEmails: string[];
  };

  // Entegrasyon Ayarları
  integrations: {
    api: {
      enablePublicAPI: boolean;
      rateLimit: number;
    };
    email: {
      provider: string;
      host: string;
      port: number;
      username: string;
      password: string;
      fromEmail: string;
    };
    sso: {
      provider: string;
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };
    slack: {
      enabled: boolean;
      webhookUrl: string;
      channel: string;
      username: string;
      iconEmoji: string;
      notifyOnErrors: boolean;
      notifyOnWarnings: boolean;
      notifyOnSuccess: boolean;
    };
  };

  // Lisans Bilgileri
  license: {
    key: string;
    company: string;
    email: string;
    expiryDate: Date;
    maxUsers: number;
    features: string[];
  };

  // Metadata
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;

  // Dinamik alan erişimi için indeks imzası
  [key: string]: any;
}

const SystemSettingsSchema: Schema = new Schema({
  // Genel Ayarlar
  companyName: {
    type: String,
    required: true,
    default: 'SpesEngine, Inc.'
  },
  systemTitle: {
    type: String,
    required: true,
    default: 'SpesEngine MDM'
  },
  defaultLanguage: {
    type: String,
    required: true,
    default: 'tr'
  },
  supportedLanguages: {
    type: [String],
    default: ['tr', 'en']
  },
  timezone: {
    type: String,
    required: true,
    default: 'Europe/Istanbul'
  },
  dateFormat: {
    type: String,
    required: true,
    default: 'DD.MM.YYYY'
  },
  timeFormat: {
    type: String,
    required: true,
    default: '24'
  },
  logoUrl: {
    type: String,
    default: '/logo.png'
  },

  // Tema Ayarları
  theme: {
    mode: {
      type: String,
      enum: ['light', 'dark', 'system', 'custom'],
      default: 'system'
    },
    enableDarkMode: {
      type: Boolean,
      default: true
    },
    defaultDarkMode: {
      type: Boolean,
      default: false
    },
    primaryColor: {
      type: String,
      default: '#1f6feb'
    },
    accentColor: {
      type: String,
      default: '#f97316'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    enableCustomFonts: {
      type: Boolean,
      default: false
    },
    customFont: {
      type: String,
      default: 'Inter'
    },
    customLogoUrl: {
      type: String,
      default: ''
    },
    enableCustomStyles: {
      type: Boolean,
      default: false
    },
    customCSS: {
      type: String,
      default: ''
    },
    showLogo: {
      type: Boolean,
      default: true
    },
    showUserAvatar: {
      type: Boolean,
      default: true
    },
    menuStyle: {
      type: String,
      enum: ['side', 'top'],
      default: 'side'
    }
  },

  // Güvenlik Ayarları
  security: {
    passwordPolicy: {
      type: String,
      enum: ['basic', 'medium', 'strong', 'very_strong'],
      default: 'medium'
    },
    passwordExpiryDays: {
      type: Number,
      default: 90
    },
    loginAttempts: {
      type: Number,
      default: 5
    },
    sessionTimeout: {
      type: Number,
      default: 60
    },
    allowedIPs: {
      type: [String],
      default: []
    },
    enableTwoFactor: {
      type: Boolean,
      default: false
    }
  },

  // Bildirim Ayarları
  notifications: {
    enableSystemNotifications: {
      type: Boolean,
      default: true
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    enablePushNotifications: {
      type: Boolean,
      default: false
    },
    notifyUserOnLogin: {
      type: Boolean,
      default: true
    },
    notifyUserOnPasswordChange: {
      type: Boolean,
      default: true
    },
    notifyUserOnRoleChange: {
      type: Boolean,
      default: true
    },
    notifyOnDataImport: {
      type: Boolean,
      default: true
    },
    notifyOnDataExport: {
      type: Boolean,
      default: true
    },
    notifyOnBulkChanges: {
      type: Boolean,
      default: true
    },
    notifyOnSystemUpdates: {
      type: Boolean,
      default: true
    },
    notifyOnBackupComplete: {
      type: Boolean,
      default: true
    },
    notifyOnSystemErrors: {
      type: Boolean,
      default: true
    },
    adminEmails: {
      type: [String],
      default: []
    }
  },

  // Entegrasyon Ayarları
  integrations: {
    api: {
      enablePublicAPI: {
        type: Boolean,
        default: false
      },
      rateLimit: {
        type: Number,
        default: 1000
      }
    },
    email: {
      provider: {
        type: String,
        default: 'smtp'
      },
      host: String,
      port: Number,
      username: String,
      password: String,
      fromEmail: String
    },
    sso: {
      provider: {
        type: String,
        default: 'none'
      },
      clientId: String,
      clientSecret: String,
      callbackUrl: String
    },
    slack: {
      enabled: {
        type: Boolean,
        default: false
      },
      webhookUrl: {
        type: String,
        default: ''
      },
      channel: {
        type: String,
        default: '#general'
      },
      username: {
        type: String,
        default: 'SpesEngine Bot'
      },
      iconEmoji: {
        type: String,
        default: ':robot_face:'
      },
      notifyOnErrors: {
        type: Boolean,
        default: true
      },
      notifyOnWarnings: {
        type: Boolean,
        default: false
      },
      notifyOnSuccess: {
        type: Boolean,
        default: false
      }
    }
  },

  // Lisans Bilgileri
  license: {
    key: String,
    company: String,
    email: String,
    expiryDate: Date,
    maxUsers: {
      type: Number,
      default: 10
    },
    features: {
      type: [String],
      default: []
    }
  },

  // Metadata
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tek bir ayar kaydı olmasını sağlamak için
SystemSettingsSchema.pre('save', async function(next) {
  const count = await mongoose.models.SystemSettings.countDocuments();
  if (count > 0 && !this.isNew) {
    next();
  } else if (count === 0 && this.isNew) {
    next();
  } else {
    next(new Error('Sadece bir sistem ayarı kaydı olabilir.'));
  }
});

export default mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema); 