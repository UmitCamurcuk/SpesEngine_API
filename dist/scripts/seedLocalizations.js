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
    },
    // Ortak kullanılan metin çevirileri
    {
        key: 'error',
        namespace: 'common',
        translations: {
            tr: 'Hata',
            en: 'Error'
        }
    },
    {
        key: 'not_found',
        namespace: 'common',
        translations: {
            tr: 'Bulunamadı',
            en: 'Not Found'
        }
    },
    {
        key: 'back_to_list',
        namespace: 'common',
        translations: {
            tr: 'Listeye Dön',
            en: 'Back to List'
        }
    },
    {
        key: 'created_at',
        namespace: 'common',
        translations: {
            tr: 'Oluşturulma',
            en: 'Created At'
        }
    },
    {
        key: 'updated_at',
        namespace: 'common',
        translations: {
            tr: 'Son Güncelleme',
            en: 'Last Updated'
        }
    },
    {
        key: 'save',
        namespace: 'common',
        translations: {
            tr: 'Kaydet',
            en: 'Save'
        }
    },
    {
        key: 'cancel',
        namespace: 'common',
        translations: {
            tr: 'İptal',
            en: 'Cancel'
        }
    },
    {
        key: 'edit',
        namespace: 'common',
        translations: {
            tr: 'Düzenle',
            en: 'Edit'
        }
    },
    {
        key: 'delete',
        namespace: 'common',
        translations: {
            tr: 'Sil',
            en: 'Delete'
        }
    },
    {
        key: 'basic_information',
        namespace: 'common',
        translations: {
            tr: 'Temel Bilgiler',
            en: 'Basic Information'
        }
    },
    {
        key: 'code',
        namespace: 'common',
        translations: {
            tr: 'Kod',
            en: 'Code'
        }
    },
    {
        key: 'type',
        namespace: 'common',
        translations: {
            tr: 'Tip',
            en: 'Type'
        }
    },
    {
        key: 'required',
        namespace: 'common',
        translations: {
            tr: 'Zorunlu',
            en: 'Required'
        }
    },
    {
        key: 'yes',
        namespace: 'common',
        translations: {
            tr: 'Evet',
            en: 'Yes'
        }
    },
    {
        key: 'no',
        namespace: 'common',
        translations: {
            tr: 'Hayır',
            en: 'No'
        }
    },
    {
        key: 'details',
        namespace: 'common',
        translations: {
            tr: 'Detaylar',
            en: 'Details'
        }
    },
    {
        key: 'description',
        namespace: 'common',
        translations: {
            tr: 'Açıklama',
            en: 'Description'
        }
    },
    {
        key: 'no_description',
        namespace: 'common',
        translations: {
            tr: 'Açıklama yok',
            en: 'No description'
        }
    },
    {
        key: 'description_required',
        namespace: 'common',
        translations: {
            tr: 'Açıklama zorunludur',
            en: 'Description is required'
        }
    },
    {
        key: 'options',
        namespace: 'common',
        translations: {
            tr: 'Seçenekler',
            en: 'Options'
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
    },
    // Liste sayfası çevirileri
    {
        key: 'manage_attributes',
        namespace: 'attributes',
        translations: {
            tr: 'Ürün ve hizmetleriniz için öznitelikleri yönetin',
            en: 'Manage attributes for your products and services'
        }
    },
    {
        key: 'new_attribute',
        namespace: 'attributes',
        translations: {
            tr: 'Yeni Öznitelik',
            en: 'New Attribute'
        }
    },
    {
        key: 'total_attributes',
        namespace: 'attributes',
        translations: {
            tr: 'Toplam Öznitelik',
            en: 'Total Attributes'
        }
    },
    {
        key: 'required_attributes',
        namespace: 'attributes',
        translations: {
            tr: 'Zorunlu Olan',
            en: 'Required'
        }
    },
    {
        key: 'on_this_page',
        namespace: 'attributes',
        translations: {
            tr: 'Bu Sayfada',
            en: 'On This Page'
        }
    },
    {
        key: 'count_unit',
        namespace: 'attributes',
        translations: {
            tr: 'adet',
            en: 'items'
        }
    },
    {
        key: 'search_attributes',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik adı, kodu veya açıklaması ara...',
            en: 'Search attribute name, code or description...'
        }
    },
    {
        key: 'search',
        namespace: 'attributes',
        translations: {
            tr: 'Ara',
            en: 'Search'
        }
    },
    {
        key: 'no_attributes_found',
        namespace: 'attributes',
        translations: {
            tr: 'Henüz hiç öznitelik bulunamadı',
            en: 'No attributes found yet'
        }
    },
    {
        key: 'add_first_attribute',
        namespace: 'attributes',
        translations: {
            tr: 'İlk Özniteliği Ekle',
            en: 'Add First Attribute'
        }
    },
    // Detay sayfası çevirileri
    {
        key: 'attribute_details',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik Detayları',
            en: 'Attribute Details'
        }
    },
    {
        key: 'basic_info',
        namespace: 'attributes',
        translations: {
            tr: 'Temel Bilgiler',
            en: 'Basic Information'
        }
    },
    {
        key: 'edit',
        namespace: 'attributes',
        translations: {
            tr: 'Düzenle',
            en: 'Edit'
        }
    },
    {
        key: 'cancel',
        namespace: 'attributes',
        translations: {
            tr: 'İptal',
            en: 'Cancel'
        }
    },
    {
        key: 'save',
        namespace: 'attributes',
        translations: {
            tr: 'Kaydet',
            en: 'Save'
        }
    },
    {
        key: 'delete',
        namespace: 'attributes',
        translations: {
            tr: 'Sil',
            en: 'Delete'
        }
    },
    {
        key: 'return_to_list',
        namespace: 'attributes',
        translations: {
            tr: 'Listeye Dön',
            en: 'Return to List'
        }
    },
    // Sütun başlıkları
    {
        key: 'name',
        namespace: 'attributes',
        translations: {
            tr: 'Ad',
            en: 'Name'
        }
    },
    {
        key: 'code',
        namespace: 'attributes',
        translations: {
            tr: 'Kod',
            en: 'Code'
        }
    },
    {
        key: 'type',
        namespace: 'attributes',
        translations: {
            tr: 'Tip',
            en: 'Type'
        }
    },
    {
        key: 'description',
        namespace: 'attributes',
        translations: {
            tr: 'Açıklama',
            en: 'Description'
        }
    },
    {
        key: 'no_description',
        namespace: 'attributes',
        translations: {
            tr: 'Açıklama yok',
            en: 'No description'
        }
    },
    {
        key: 'is_required',
        namespace: 'attributes',
        translations: {
            tr: 'Zorunlu',
            en: 'Required'
        }
    },
    {
        key: 'last_update',
        namespace: 'attributes',
        translations: {
            tr: 'Son Güncelleme',
            en: 'Last Update'
        }
    },
    {
        key: 'yes',
        namespace: 'attributes',
        translations: {
            tr: 'Evet',
            en: 'Yes'
        }
    },
    {
        key: 'no',
        namespace: 'attributes',
        translations: {
            tr: 'Hayır',
            en: 'No'
        }
    },
    {
        key: 'view',
        namespace: 'attributes',
        translations: {
            tr: 'Görüntüle',
            en: 'View'
        }
    },
    // Create sayfası çevirileri
    {
        key: 'create_new_attribute',
        namespace: 'attributes',
        translations: {
            tr: 'Yeni Öznitelik Oluştur',
            en: 'Create New Attribute'
        }
    },
    {
        key: 'define_new_attribute',
        namespace: 'attributes',
        translations: {
            tr: 'Ürün ve hizmetleriniz için yeni bir öznitelik tanımlayın',
            en: 'Define a new attribute for your products and services'
        }
    },
    {
        key: 'attribute_group',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik Grubu',
            en: 'Attribute Group'
        }
    },
    {
        key: 'select_group',
        namespace: 'attributes',
        translations: {
            tr: 'Grup Seçin',
            en: 'Select Group'
        }
    },
    {
        key: 'options',
        namespace: 'attributes',
        translations: {
            tr: 'Seçenekler',
            en: 'Options'
        }
    },
    {
        key: 'options_info',
        namespace: 'attributes',
        translations: {
            tr: 'Her satıra bir seçenek yazın',
            en: 'Write one option per line'
        }
    },
    {
        key: 'create',
        namespace: 'attributes',
        translations: {
            tr: 'Oluştur',
            en: 'Create'
        }
    },
    {
        key: 'delete_confirm',
        namespace: 'attributes',
        translations: {
            tr: 'özniteliğini silmek istediğinize emin misiniz?',
            en: 'Are you sure you want to delete the attribute?'
        }
    },
    // AttributeType çevirileri
    {
        key: 'text',
        namespace: 'attribute_types',
        translations: {
            tr: 'Metin',
            en: 'Text'
        }
    },
    {
        key: 'number',
        namespace: 'attribute_types',
        translations: {
            tr: 'Sayı',
            en: 'Number'
        }
    },
    {
        key: 'date',
        namespace: 'attribute_types',
        translations: {
            tr: 'Tarih',
            en: 'Date'
        }
    },
    {
        key: 'boolean',
        namespace: 'attribute_types',
        translations: {
            tr: 'Evet/Hayır',
            en: 'Yes/No'
        }
    },
    {
        key: 'select',
        namespace: 'attribute_types',
        translations: {
            tr: 'Seçim',
            en: 'Select'
        }
    },
    {
        key: 'multiselect',
        namespace: 'attribute_types',
        translations: {
            tr: 'Çoklu Seçim',
            en: 'Multi-select'
        }
    },
    // Create sayfası ek çevirileri
    {
        key: 'name_required',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik adı zorunludur',
            en: 'Attribute name is required'
        }
    },
    {
        key: 'code_required',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik kodu zorunludur',
            en: 'Attribute code is required'
        }
    },
    {
        key: 'code_invalid_format',
        namespace: 'attributes',
        translations: {
            tr: 'Kod yalnızca küçük harfler, sayılar ve alt çizgi içerebilir',
            en: 'Code can only contain lowercase letters, numbers and underscores'
        }
    },
    {
        key: 'options_required',
        namespace: 'attributes',
        translations: {
            tr: 'Seçim tipi için en az bir seçenek belirtmelisiniz',
            en: 'You must specify at least one option for selection type'
        }
    },
    {
        key: 'detail_info',
        namespace: 'attributes',
        translations: {
            tr: 'Detay Bilgiler',
            en: 'Detail Information'
        }
    },
    {
        key: 'name_placeholder',
        namespace: 'attributes',
        translations: {
            tr: 'Örn: Renk, Boyut, Marka, vb.',
            en: 'E.g.: Color, Size, Brand, etc.'
        }
    },
    {
        key: 'code_placeholder',
        namespace: 'attributes',
        translations: {
            tr: 'Örn: color, size, brand, vb.',
            en: 'E.g.: color, size, brand, etc.'
        }
    },
    {
        key: 'code_help',
        namespace: 'attributes',
        translations: {
            tr: 'Yalnızca küçük harfler, sayılar ve alt çizgi kullanabilirsiniz (örn: color_code_1)',
            en: 'You can only use lowercase letters, numbers and underscores (e.g.: color_code_1)'
        }
    },
    {
        key: 'description_placeholder',
        namespace: 'attributes',
        translations: {
            tr: 'Bu öznitelik hakkında açıklayıcı bilgiler...',
            en: 'Descriptive information about this attribute...'
        }
    },
    {
        key: 'no_groups',
        namespace: 'attributes',
        translations: {
            tr: 'Henüz öznitelik grubu bulunmuyor',
            en: 'No attribute groups available yet'
        }
    },
    {
        key: 'group_help',
        namespace: 'attributes',
        translations: {
            tr: 'Bu özniteliği bir gruba dahil etmek istiyorsanız seçebilirsiniz',
            en: 'You can select this if you want to include this attribute in a group'
        }
    },
    {
        key: 'options_placeholder',
        namespace: 'attributes',
        translations: {
            tr: 'Seçenekleri virgülle ayırarak girin',
            en: 'Enter options separated by commas'
        }
    },
    {
        key: 'preview',
        namespace: 'attributes',
        translations: {
            tr: 'Önizleme',
            en: 'Preview'
        }
    },
    {
        key: 'is_required_help',
        namespace: 'attributes',
        translations: {
            tr: 'Bu özniteliğin doldurulması zorunlu olsun mu?',
            en: 'Should this attribute be required to fill in?'
        }
    },
    {
        key: 'saving',
        namespace: 'attributes',
        translations: {
            tr: 'Kaydediliyor...',
            en: 'Saving...'
        }
    },
    // AttributeDetailsPage için ek çeviriler
    {
        key: 'attribute_details_fetch_error',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik bilgileri getirilirken bir hata oluştu',
            en: 'An error occurred while fetching attribute details'
        }
    },
    {
        key: 'attribute_group_fetch_error',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik grubu getirilirken hata oluştu',
            en: 'Error occurred while fetching attribute group'
        }
    },
    {
        key: 'attribute_updated_success',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik başarıyla güncellendi',
            en: 'Attribute updated successfully'
        }
    },
    {
        key: 'attribute_update_error',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik güncellenirken bir hata oluştu',
            en: 'An error occurred while updating the attribute'
        }
    },
    {
        key: 'attribute_delete_error',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik silinirken bir hata oluştu',
            en: 'An error occurred while deleting the attribute'
        }
    },
    {
        key: 'confirm_delete_attribute',
        namespace: 'attributes',
        translations: {
            tr: '"{{name}}" özniteliğini silmek istediğinize emin misiniz?',
            en: 'Are you sure you want to delete the attribute "{{name}}"?'
        }
    },
    {
        key: 'attribute_not_found',
        namespace: 'attributes',
        translations: {
            tr: 'İstenen öznitelik bulunamadı.',
            en: 'The requested attribute was not found.'
        }
    },
    {
        key: 'attribute_group',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik Grubu',
            en: 'Attribute Group'
        }
    },
    {
        key: 'options_placeholder',
        namespace: 'attributes',
        translations: {
            tr: 'Seçenekleri virgülle ayırarak yazın',
            en: 'Enter options separated by commas'
        }
    },
    {
        key: 'options_help',
        namespace: 'attributes',
        translations: {
            tr: 'Seçenekleri virgülle ayırın (örn: Kırmızı, Mavi, Yeşil)',
            en: 'Separate options with commas (e.g.: Red, Blue, Green)'
        }
    },
    {
        key: 'no_options',
        namespace: 'attributes',
        translations: {
            tr: 'Seçenek yok',
            en: 'No options'
        }
    },
    {
        key: 'system_info_and_history',
        namespace: 'attributes',
        translations: {
            tr: 'Sistem Bilgileri ve İşlem Geçmişi',
            en: 'System Information and History'
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
// UI öğeleri ve menüler için çeviriler
const uiTranslations = [
    // Sidebar ana menü
    {
        key: 'home',
        namespace: 'menu',
        translations: {
            tr: 'Ana Sayfa',
            en: 'Home'
        }
    },
    {
        key: 'attributes',
        namespace: 'menu',
        translations: {
            tr: 'Öznitelikler',
            en: 'Attributes'
        }
    },
    {
        key: 'attribute_groups',
        namespace: 'menu',
        translations: {
            tr: 'Öznitelik Grupları',
            en: 'Attribute Groups'
        }
    },
    {
        key: 'item_types',
        namespace: 'menu',
        translations: {
            tr: 'Öğe Tipleri',
            en: 'Item Types'
        }
    },
    {
        key: 'items',
        namespace: 'menu',
        translations: {
            tr: 'Öğeler',
            en: 'Items'
        }
    },
    {
        key: 'categories',
        namespace: 'menu',
        translations: {
            tr: 'Kategoriler',
            en: 'Categories'
        }
    },
    {
        key: 'families',
        namespace: 'menu',
        translations: {
            tr: 'Aileler',
            en: 'Families'
        }
    },
    {
        key: 'roles',
        namespace: 'menu',
        translations: {
            tr: 'Roller',
            en: 'Roles'
        }
    },
    {
        key: 'permissions',
        namespace: 'menu',
        translations: {
            tr: 'İzinler',
            en: 'Permissions'
        }
    },
    {
        key: 'permission_groups',
        namespace: 'menu',
        translations: {
            tr: 'İzin Grupları',
            en: 'Permission Groups'
        }
    },
    {
        key: 'localization',
        namespace: 'menu',
        translations: {
            tr: 'Lokalizasyon',
            en: 'Localization'
        }
    },
    // Alt menü öğeleri
    {
        key: 'attribute_list',
        namespace: 'menu',
        translations: {
            tr: 'Öznitelik Listesi',
            en: 'Attribute List'
        }
    },
    {
        key: 'add_attribute',
        namespace: 'menu',
        translations: {
            tr: 'Öznitelik Ekle',
            en: 'Add Attribute'
        }
    },
    {
        key: 'group_list',
        namespace: 'menu',
        translations: {
            tr: 'Grup Listesi',
            en: 'Group List'
        }
    },
    {
        key: 'add_group',
        namespace: 'menu',
        translations: {
            tr: 'Grup Ekle',
            en: 'Add Group'
        }
    },
    {
        key: 'type_list',
        namespace: 'menu',
        translations: {
            tr: 'Tip Listesi',
            en: 'Type List'
        }
    },
    {
        key: 'add_type',
        namespace: 'menu',
        translations: {
            tr: 'Tip Ekle',
            en: 'Add Type'
        }
    },
    {
        key: 'item_list',
        namespace: 'menu',
        translations: {
            tr: 'Öğe Listesi',
            en: 'Item List'
        }
    },
    {
        key: 'add_item',
        namespace: 'menu',
        translations: {
            tr: 'Öğe Ekle',
            en: 'Add Item'
        }
    },
    {
        key: 'category_list',
        namespace: 'menu',
        translations: {
            tr: 'Kategori Listesi',
            en: 'Category List'
        }
    },
    {
        key: 'add_category',
        namespace: 'menu',
        translations: {
            tr: 'Kategori Ekle',
            en: 'Add Category'
        }
    },
    {
        key: 'family_list',
        namespace: 'menu',
        translations: {
            tr: 'Aile Listesi',
            en: 'Family List'
        }
    },
    {
        key: 'add_family',
        namespace: 'menu',
        translations: {
            tr: 'Aile Ekle',
            en: 'Add Family'
        }
    },
    {
        key: 'role_list',
        namespace: 'menu',
        translations: {
            tr: 'Rol Listesi',
            en: 'Role List'
        }
    },
    {
        key: 'add_role',
        namespace: 'menu',
        translations: {
            tr: 'Rol Ekle',
            en: 'Add Role'
        }
    },
    {
        key: 'permission_list',
        namespace: 'menu',
        translations: {
            tr: 'İzin Listesi',
            en: 'Permission List'
        }
    },
    {
        key: 'add_permission',
        namespace: 'menu',
        translations: {
            tr: 'İzin Ekle',
            en: 'Add Permission'
        }
    },
    {
        key: 'permission_group_list',
        namespace: 'menu',
        translations: {
            tr: 'Grup Listesi',
            en: 'Group List'
        }
    },
    {
        key: 'add_permission_group',
        namespace: 'menu',
        translations: {
            tr: 'Grup Ekle',
            en: 'Add Group'
        }
    },
    {
        key: 'translation_list',
        namespace: 'menu',
        translations: {
            tr: 'Çeviri Listesi',
            en: 'Translation List'
        }
    },
    {
        key: 'add_translation',
        namespace: 'menu',
        translations: {
            tr: 'Çeviri Ekle',
            en: 'Add Translation'
        }
    },
    // Lokalizasyon sayfası metinleri
    {
        key: 'translations',
        namespace: 'localizations',
        translations: {
            tr: 'Çeviriler',
            en: 'Translations'
        }
    },
    {
        key: 'manage_all_translations',
        namespace: 'localizations',
        translations: {
            tr: 'Sistemdeki tüm çevirileri yönetin',
            en: 'Manage all translations in the system'
        }
    },
    {
        key: 'add_new_translation',
        namespace: 'localizations',
        translations: {
            tr: 'Yeni Çeviri Ekle',
            en: 'Add New Translation'
        }
    },
    {
        key: 'total_translations',
        namespace: 'localizations',
        translations: {
            tr: 'Toplam Çeviri',
            en: 'Total Translations'
        }
    },
    {
        key: 'namespace_count',
        namespace: 'localizations',
        translations: {
            tr: 'Namespace Sayısı',
            en: 'Namespace Count'
        }
    },
    {
        key: 'language_count',
        namespace: 'localizations',
        translations: {
            tr: 'Dil Sayısı',
            en: 'Language Count'
        }
    },
    {
        key: 'search_key_namespace',
        namespace: 'localizations',
        translations: {
            tr: 'Anahtar veya namespace ara...',
            en: 'Search key or namespace...'
        }
    },
    {
        key: 'key',
        namespace: 'localizations',
        translations: {
            tr: 'Anahtar',
            en: 'Key'
        }
    },
    {
        key: 'namespace',
        namespace: 'localizations',
        translations: {
            tr: 'Namespace',
            en: 'Namespace'
        }
    },
    {
        key: 'turkish',
        namespace: 'localizations',
        translations: {
            tr: 'Türkçe',
            en: 'Turkish'
        }
    },
    {
        key: 'english',
        namespace: 'localizations',
        translations: {
            tr: 'İngilizce',
            en: 'English'
        }
    },
    {
        key: 'actions',
        namespace: 'localizations',
        translations: {
            tr: 'İşlemler',
            en: 'Actions'
        }
    },
    {
        key: 'details',
        namespace: 'localizations',
        translations: {
            tr: 'Detay',
            en: 'Details'
        }
    },
    {
        key: 'delete',
        namespace: 'localizations',
        translations: {
            tr: 'Sil',
            en: 'Delete'
        }
    },
    {
        key: 'no_translations_found',
        namespace: 'localizations',
        translations: {
            tr: 'Hiç çeviri bulunamadı.',
            en: 'No translations found.'
        }
    },
    {
        key: 'translation_details',
        namespace: 'localizations',
        translations: {
            tr: 'Çeviri Detayları',
            en: 'Translation Details'
        }
    },
    {
        key: 'add_new_translation',
        namespace: 'localizations',
        translations: {
            tr: 'Yeni Çeviri Ekle',
            en: 'Add New Translation'
        }
    },
    {
        key: 'fill_form_to_add',
        namespace: 'localizations',
        translations: {
            tr: 'Sisteme yeni çeviri eklemek için formu doldurun',
            en: 'Fill the form to add a new translation to the system'
        }
    },
    {
        key: 'edit',
        namespace: 'localizations',
        translations: {
            tr: 'Düzenle',
            en: 'Edit'
        }
    },
    {
        key: 'cancel',
        namespace: 'localizations',
        translations: {
            tr: 'İptal',
            en: 'Cancel'
        }
    },
    {
        key: 'save',
        namespace: 'localizations',
        translations: {
            tr: 'Kaydet',
            en: 'Save'
        }
    },
    {
        key: 'saving',
        namespace: 'localizations',
        translations: {
            tr: 'Kaydediliyor...',
            en: 'Saving...'
        }
    },
    {
        key: 'adding',
        namespace: 'localizations',
        translations: {
            tr: 'Ekleniyor...',
            en: 'Adding...'
        }
    },
    {
        key: 'add',
        namespace: 'localizations',
        translations: {
            tr: 'Ekle',
            en: 'Add'
        }
    },
    // Genel UI öğeleri
    {
        key: 'search',
        namespace: 'ui',
        translations: {
            tr: 'Ara',
            en: 'Search'
        }
    },
    {
        key: 'loading',
        namespace: 'ui',
        translations: {
            tr: 'Yükleniyor...',
            en: 'Loading...'
        }
    },
    {
        key: 'page_not_found',
        namespace: 'ui',
        translations: {
            tr: 'Sayfa bulunamadı.',
            en: 'Page not found.'
        }
    }
];
// Tema çevirileri
const themeTranslations = [
    {
        key: 'switch_to_light',
        namespace: 'theme',
        translations: {
            tr: 'Açık temaya geç',
            en: 'Switch to light theme'
        }
    },
    {
        key: 'switch_to_dark',
        namespace: 'theme',
        translations: {
            tr: 'Koyu temaya geç',
            en: 'Switch to dark theme'
        }
    }
];
// Auth çevirileri
const authTranslations = [
    {
        key: 'login_to_account',
        namespace: 'auth',
        translations: {
            tr: 'Hesabınıza giriş yapın',
            en: 'Log in to your account'
        }
    },
    {
        key: 'create_new_account',
        namespace: 'auth',
        translations: {
            tr: 'yeni bir hesap oluşturun',
            en: 'create a new account'
        }
    },
    {
        key: 'email_address',
        namespace: 'auth',
        translations: {
            tr: 'E-posta Adresi',
            en: 'Email Address'
        }
    },
    {
        key: 'password',
        namespace: 'auth',
        translations: {
            tr: 'Şifre',
            en: 'Password'
        }
    },
    {
        key: 'forgot_password',
        namespace: 'auth',
        translations: {
            tr: 'Şifrenizi mi unuttunuz?',
            en: 'Forgot your password?'
        }
    },
    {
        key: 'remember_me',
        namespace: 'auth',
        translations: {
            tr: 'Beni hatırla',
            en: 'Remember me'
        }
    },
    {
        key: 'login',
        namespace: 'auth',
        translations: {
            tr: 'Giriş Yap',
            en: 'Log in'
        }
    },
    {
        key: 'or_continue_with',
        namespace: 'auth',
        translations: {
            tr: 'Veya şununla devam et',
            en: 'Or continue with'
        }
    },
    {
        key: 'register',
        namespace: 'auth',
        translations: {
            tr: 'Kayıt Ol',
            en: 'Register'
        }
    },
    {
        key: 'register_account',
        namespace: 'auth',
        translations: {
            tr: 'Yeni bir hesap oluşturun',
            en: 'Create a new account'
        }
    },
    {
        key: 'first_name',
        namespace: 'auth',
        translations: {
            tr: 'Ad',
            en: 'First Name'
        }
    },
    {
        key: 'last_name',
        namespace: 'auth',
        translations: {
            tr: 'Soyad',
            en: 'Last Name'
        }
    },
    {
        key: 'confirm_password',
        namespace: 'auth',
        translations: {
            tr: 'Şifreyi Onayla',
            en: 'Confirm Password'
        }
    },
    {
        key: 'passwords_dont_match',
        namespace: 'auth',
        translations: {
            tr: 'Şifreler eşleşmiyor.',
            en: 'Passwords do not match.'
        }
    },
    {
        key: 'login_with_existing',
        namespace: 'auth',
        translations: {
            tr: 'mevcut hesabınızla giriş yapın',
            en: 'log in with your existing account'
        }
    },
    {
        key: 'terms_of_service',
        namespace: 'auth',
        translations: {
            tr: 'Kullanım Koşulları',
            en: 'Terms of Service'
        }
    },
    {
        key: 'privacy_policy',
        namespace: 'auth',
        translations: {
            tr: 'Gizlilik Politikası',
            en: 'Privacy Policy'
        }
    },
    {
        key: 'accept_terms',
        namespace: 'auth',
        translations: {
            tr: "'nı kabul ediyorum",
            en: "I accept"
        }
    }
];
// Common namespace için ek çeviriler
const additionalCommonTranslations = [
    {
        key: 'or',
        namespace: 'common',
        translations: {
            tr: 'Veya',
            en: 'Or'
        }
    },
    {
        key: 'and',
        namespace: 'common',
        translations: {
            tr: 've',
            en: 'and'
        }
    }
];
// Navigasyon çevirileri
const navTranslations = [
    {
        key: 'open_user_menu',
        namespace: 'nav',
        translations: {
            tr: 'Kullanıcı menüsünü aç',
            en: 'Open user menu'
        }
    },
    {
        key: 'my_profile',
        namespace: 'nav',
        translations: {
            tr: 'Profilim',
            en: 'My Profile'
        }
    },
    {
        key: 'notifications',
        namespace: 'nav',
        translations: {
            tr: 'Bildirimler',
            en: 'Notifications'
        }
    }
];
// AttributeType çevirileri için tip açıklamaları
const attributeTypeDescriptions = [
    {
        key: 'text_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Metin girişi için kullanılır. Ürün açıklaması, model numarası gibi bilgiler için idealdir.',
            en: 'Used for text input. Ideal for product descriptions, model numbers, and similar information.'
        }
    },
    {
        key: 'number_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Sayısal değerler için kullanılır. Fiyat, miktar, ağırlık gibi bilgiler için idealdir.',
            en: 'Used for numerical values. Ideal for price, quantity, weight, and similar information.'
        }
    },
    {
        key: 'date_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Tarih bilgisi için kullanılır. Üretim tarihi, son kullanma tarihi gibi bilgiler için idealdir.',
            en: 'Used for date information. Ideal for production date, expiration date, and similar information.'
        }
    },
    {
        key: 'boolean_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Evet/Hayır tipinde bilgiler için kullanılır. Stokta var mı, aktif mi gibi bilgiler için idealdir.',
            en: 'Used for Yes/No type information. Ideal for in stock, active status, and similar information.'
        }
    },
    {
        key: 'select_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Tek seçimlik listeler için kullanılır. Renk, beden, kategori gibi bilgiler için idealdir.',
            en: 'Used for single selection lists. Ideal for color, size, category, and similar information.'
        }
    },
    {
        key: 'multiselect_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Çoklu seçim gerektiren listeler için kullanılır. Özellikler, etiketler gibi bilgiler için idealdir.',
            en: 'Used for multiple selection lists. Ideal for features, tags, and similar information.'
        }
    }
];
// AttributeGroup çevirileri
const attributeGroupTranslations = [
    {
        key: 'attribute_groups_fetch_error',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grupları getirilirken bir hata oluştu',
            en: 'An error occurred while fetching attribute groups'
        }
    },
    {
        key: 'attribute_group_delete_error',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grubu silinirken bir hata oluştu',
            en: 'An error occurred while deleting the attribute group'
        }
    },
    {
        key: 'confirm_delete_attribute_group',
        namespace: 'attribute_groups',
        translations: {
            tr: '"{{name}}" öznitelik grubunu silmek istediğinize emin misiniz?',
            en: 'Are you sure you want to delete the attribute group "{{name}}"?'
        }
    },
    {
        key: 'attribute_count',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik Sayısı',
            en: 'Attribute Count'
        }
    },
    {
        key: 'no_attribute_groups_found',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grubu bulunamadı',
            en: 'No attribute groups found'
        }
    },
    {
        key: 'new_group',
        namespace: 'attributes',
        translations: {
            tr: 'Yeni Grup',
            en: 'New Group'
        }
    },
    {
        key: 'group_name_required',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grup adı zorunludur',
            en: 'Attribute group name is required'
        }
    },
    {
        key: 'group_code_required',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grup kodu zorunludur',
            en: 'Attribute group code is required'
        }
    },
    {
        key: 'attribute_group_create_error',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grubu oluşturulurken bir hata oluştu',
            en: 'An error occurred while creating the attribute group'
        }
    },
    {
        key: 'newAttributeGroup',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Yeni Öznitelik Grubu Oluştur',
            en: 'Create New Attribute Group'
        }
    },
    {
        key: 'createAttributeGroupDescription',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Ürün ve hizmetleriniz için yeni bir öznitelik grubu tanımlayın',
            en: 'Define a new attribute group for your products and services'
        }
    },
    {
        key: 'returnToList',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Listeye Dön',
            en: 'Return to List'
        }
    },
    {
        key: 'groupName',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Grup Adı',
            en: 'Group Name'
        }
    },
    {
        key: 'enterGroupName',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Örn: Temel Bilgiler',
            en: 'E.g.: Basic Information'
        }
    },
    {
        key: 'groupCode',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Grup Kodu',
            en: 'Group Code'
        }
    },
    {
        key: 'enterGroupCode',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Örn: temel_bilgiler',
            en: 'E.g.: basic_information'
        }
    },
    {
        key: 'groupCodeInstructions',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Yalnızca küçük harfler, sayılar ve alt çizgi kullanın. Boşluk olmamalıdır.',
            en: 'Use only lowercase letters, numbers, and underscores. No spaces allowed.'
        }
    },
    {
        key: 'enterDescription',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Bu grup hakkında kısa bir açıklama yazın...',
            en: 'Write a short description about this group...'
        }
    },
    {
        key: 'related_attributes_fetch_error',
        namespace: 'attribute_groups',
        translations: {
            tr: 'İlişkili öznitelikler getirilirken hata oluştu',
            en: 'Error occurred while fetching related attributes'
        }
    },
    {
        key: 'attribute_group_details_fetch_error',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grubu bilgileri getirilirken bir hata oluştu',
            en: 'An error occurred while fetching attribute group details'
        }
    },
    {
        key: 'attribute_group_updated_success',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grubu başarıyla güncellendi',
            en: 'Attribute group updated successfully'
        }
    },
    {
        key: 'attribute_group_update_error',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grubu güncellenirken bir hata oluştu',
            en: 'An error occurred while updating the attribute group'
        }
    },
    {
        key: 'attribute_group_not_found',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik grubu bulunamadı veya silinmiş olabilir',
            en: 'Attribute group not found or may have been deleted'
        }
    },
    {
        key: 'attribute_group_name',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik Grup Adı',
            en: 'Attribute Group Name'
        }
    },
    {
        key: 'metadata',
        namespace: 'common',
        translations: {
            tr: 'Meta Bilgiler',
            en: 'Metadata'
        }
    },
    {
        key: 'related_attributes',
        namespace: 'attribute_groups',
        translations: {
            tr: 'İlişkili Öznitelikler',
            en: 'Related Attributes'
        }
    },
    {
        key: 'attribute',
        namespace: 'attribute_groups',
        translations: {
            tr: 'öznitelik',
            en: 'attribute'
        }
    },
    {
        key: 'attributes_loading',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Öznitelik detayları yükleniyor...',
            en: 'Loading attribute details...'
        }
    },
    {
        key: 'no_related_attributes',
        namespace: 'attribute_groups',
        translations: {
            tr: 'Bu gruba bağlı öznitelik bulunmuyor',
            en: 'No attributes associated with this group'
        }
    }
];
// Attributes için ek çeviriler 
const additionalAttributeTranslations = [
    {
        key: 'option',
        namespace: 'attributes',
        translations: {
            tr: 'Seçenek',
            en: 'Option'
        }
    },
    {
        key: 'attribute_create_error',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik oluşturulurken bir hata oluştu',
            en: 'An error occurred while creating the attribute'
        }
    }
];
// Common namespace için ek çeviriler
const moreCommonTranslations = [
    {
        key: 'status',
        namespace: 'common',
        translations: {
            tr: 'Durum',
            en: 'Status'
        }
    },
    {
        key: 'active',
        namespace: 'common',
        translations: {
            tr: 'Aktif',
            en: 'Active'
        }
    },
    {
        key: 'inactive',
        namespace: 'common',
        translations: {
            tr: 'Pasif',
            en: 'Inactive'
        }
    },
    {
        key: 'last_update',
        namespace: 'common',
        translations: {
            tr: 'Son Güncelleme',
            en: 'Last Update'
        }
    },
    {
        key: 'total',
        namespace: 'common',
        translations: {
            tr: 'Toplam',
            en: 'Total'
        }
    },
    {
        key: 'group',
        namespace: 'common',
        translations: {
            tr: 'grup',
            en: 'group'
        }
    }
];
// Tüm çeviriler
const translations = [
    ...commonTranslations,
    ...productTranslations,
    ...errorTranslations,
    ...attributeTranslations,
    ...profileTranslations,
    ...uiTranslations,
    ...themeTranslations,
    ...authTranslations,
    ...additionalCommonTranslations,
    ...navTranslations,
    ...attributeGroupTranslations,
    ...additionalAttributeTranslations,
    ...moreCommonTranslations,
    ...attributeTypeDescriptions
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
            console.log(`Çeviri ekleniyor: ${namespace}:${key}`);
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
