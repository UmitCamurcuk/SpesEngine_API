import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import Localization from '../models/Localization';
import localizationService from '../services/localizationService';

// Env değişkenlerini yükle
dotenv.config();

// MongoDB bağlantısı
connectDB();

// Çeviri türleri
interface Translation {
  key: string;
  namespace?: string;
  translations: {
    [lang: string]: string;
  };
}

// Temel çeviriler - ortak
const commonTranslations: Translation[] = [
  {
    key: 'app_name',
    translations: {
      tr: 'SpesEngine MDM',
      en: 'SpesEngine MDM'
    }
  },
  {
    key: 'welcome_message',
    translations: {
      tr: 'SpesEngine Master Data Management sistemine hoş geldiniz.',
      en: 'Welcome to SpesEngine Master Data Management system.'
    }
  },
  {
    key: 'greeting',
    translations: {
      tr: 'Merhaba',
      en: 'Hello'
    }
  },
  {
    key: 'loading',
    translations: {
      tr: 'Yükleniyor...',
      en: 'Loading...'
    }
  },
  {
    key: 'save',
    translations: {
      tr: 'Kaydet',
      en: 'Save'
    }
  },
  {
    key: 'cancel',
    translations: {
      tr: 'İptal',
      en: 'Cancel'
    }
  },
  {
    key: 'delete',
    translations: {
      tr: 'Sil',
      en: 'Delete'
    }
  },
  {
    key: 'edit',
    translations: {
      tr: 'Düzenle',
      en: 'Edit'
    }
  },
  {
    key: 'create',
    translations: {
      tr: 'Oluştur',
      en: 'Create'
    }
  },
  {
    key: 'search',
    translations: {
      tr: 'Ara',
      en: 'Search'
    }
  },
  {
    key: 'filter',
    translations: {
      tr: 'Filtrele',
      en: 'Filter'
    }
  },
  {
    key: 'settings',
    translations: {
      tr: 'Ayarlar',
      en: 'Settings'
    }
  },
  {
    key: 'profile',
    translations: {
      tr: 'Profil',
      en: 'Profile'
    }
  },
  {
    key: 'logout',
    translations: {
      tr: 'Çıkış Yap',
      en: 'Logout'
    }
  },
  {
    key: 'current_language',
    translations: {
      tr: 'Mevcut Dil',
      en: 'Current Language'
    }
  },
  {
    key: 'translation_example_title',
    translations: {
      tr: 'Çeviri Örneği',
      en: 'Translation Example'
    }
  },
  {
    key: 'translation_help_text',
    translations: {
      tr: 'Çeviri sistemi, uygulamanın farklı dillerde kullanılabilmesini sağlar.',
      en: 'The translation system allows the application to be used in different languages.'
    }
  }
];

// Ürün ile ilgili çeviriler
const productTranslations: Translation[] = [
  {
    key: 'product_example',
    namespace: 'products',
    translations: {
      tr: 'Ürün Örneği',
      en: 'Product Example'
    }
  },
  {
    key: 'product_description',
    namespace: 'products',
    translations: {
      tr: 'Bu bir ürün açıklaması örneğidir.',
      en: 'This is an example of a product description.'
    }
  },
  {
    key: 'product_list',
    namespace: 'products',
    translations: {
      tr: 'Ürün Listesi',
      en: 'Product List'
    }
  },
  {
    key: 'product_details',
    namespace: 'products',
    translations: {
      tr: 'Ürün Detayları',
      en: 'Product Details'
    }
  }
];

// Hata mesajları çevirileri
const errorTranslations: Translation[] = [
  {
    key: 'error_example',
    namespace: 'errors',
    translations: {
      tr: 'Hata Örneği',
      en: 'Error Example'
    }
  },
  {
    key: 'error_not_found',
    namespace: 'errors',
    translations: {
      tr: 'Sayfa bulunamadı',
      en: 'Page not found'
    }
  },
  {
    key: 'error_unauthorized',
    namespace: 'errors',
    translations: {
      tr: 'Bu kaynağa erişim yetkiniz yok',
      en: 'You do not have permission to access this resource'
    }
  },
  {
    key: 'error_server',
    namespace: 'errors',
    translations: {
      tr: 'Sunucu hatası oluştu',
      en: 'Server error occurred'
    }
  }
];

// Öznitelik çevirileri
const attributeTranslations: Translation[] = [
  {
    key: 'attributes_title',
    namespace: 'attributes',
    translations: {
      tr: 'Öznitelikler',
      en: 'Attributes'
    }
  },
  {
    key: 'attribute_groups_title',
    namespace: 'attributes',
    translations: {
      tr: 'Öznitelik Grupları',
      en: 'Attribute Groups'
    }
  },
  {
    key: 'create_attribute',
    namespace: 'attributes',
    translations: {
      tr: 'Öznitelik Oluştur',
      en: 'Create Attribute'
    }
  },
  {
    key: 'edit_attribute',
    namespace: 'attributes',
    translations: {
      tr: 'Öznitelik Düzenle',
      en: 'Edit Attribute'
    }
  }
];

// Profil sayfası çevirileri
const profileTranslations: Translation[] = [
  {
    key: 'profile',
    translations: {
      tr: 'Profil',
      en: 'Profile'
    }
  },
  {
    key: 'profile_information',
    translations: {
      tr: 'Profil Bilgileri',
      en: 'Profile Information'
    }
  },
  {
    key: 'name',
    translations: {
      tr: 'Ad',
      en: 'Name'
    }
  },
  {
    key: 'email',
    translations: {
      tr: 'E-posta',
      en: 'Email'
    }
  },
  {
    key: 'role',
    translations: {
      tr: 'Rol',
      en: 'Role'
    }
  }
];

// Tüm çeviriler
const translations: Translation[] = [
  ...commonTranslations,
  ...productTranslations,
  ...errorTranslations,
  ...attributeTranslations,
  ...profileTranslations
];

// Çevirileri ekle
const seedLocalizations = async () => {
  try {
    // Önce koleksiyonu temizle
    await Localization.deleteMany({});
    console.log('Mevcut çeviriler silindi');

    // Her çeviriyi ekle
    for (const translation of translations) {
      const { key, namespace = 'common', translations } = translation;
      await localizationService.upsertTranslation({
        key,
        namespace,
        translations
      });
    }

    console.log(`${translations.length} çeviri başarıyla eklendi`);
    process.exit(0);
  } catch (error) {
    console.error('Hata oluştu:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
seedLocalizations(); 