"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../config/database"));
const Localization_1 = __importDefault(require("../models/Localization"));
const localizationService_1 = __importDefault(require("../services/localizationService"));
// Env değişkenlerini yükle
dotenv_1.default.config();
// MongoDB bağlantısı
(0, database_1.default)();
// Temel çeviriler - ortak
const commonTranslations = [
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
const productTranslations = [
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
const errorTranslations = [
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
const attributeTranslations = [
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
const profileTranslations = [
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
const translations = [
    ...commonTranslations,
    ...productTranslations,
    ...errorTranslations,
    ...attributeTranslations,
    ...profileTranslations
];
// Çevirileri ekle
const seedLocalizations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Önce koleksiyonu temizle
        yield Localization_1.default.deleteMany({});
        console.log('Mevcut çeviriler silindi');
        // Her çeviriyi ekle
        for (const translation of translations) {
            const { key, namespace = 'common', translations } = translation;
            yield localizationService_1.default.upsertTranslation({
                key,
                namespace,
                translations
            });
        }
        console.log(`${translations.length} çeviri başarıyla eklendi`);
        process.exit(0);
    }
    catch (error) {
        console.error('Hata oluştu:', error);
        process.exit(1);
    }
});
// Script'i çalıştır
seedLocalizations();
