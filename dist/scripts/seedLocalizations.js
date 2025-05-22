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
    },
    {
        key: 'general_information',
        namespace: 'common',
        translations: {
            tr: 'Genel Bilgiler',
            en: 'General Information'
        }
    },
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
        key: 'saving',
        namespace: 'common',
        translations: {
            tr: 'Kaydediliyor...',
            en: 'Saving...'
        }
    },
    {
        key: 'select_all',
        namespace: 'common',
        translations: {
            tr: 'Tümünü Seç',
            en: 'Select All'
        }
    },
    {
        key: 'select_none',
        namespace: 'common',
        translations: {
            tr: 'Hiçbirini Seçme',
            en: 'Select None'
        }
    },
    {
        key: 'history',
        namespace: 'common',
        translations: {
            tr: 'Değişiklik Geçmişi',
            en: 'Change History'
        }
    },
    {
        key: 'created',
        namespace: 'common',
        translations: {
            tr: 'Oluşturuldu',
            en: 'Created'
        }
    },
    {
        key: 'updated',
        namespace: 'common',
        translations: {
            tr: 'Güncellendi',
            en: 'Updated'
        }
    },
    {
        key: 'deleted',
        namespace: 'common',
        translations: {
            tr: 'Silindi',
            en: 'Deleted'
        }
    },
    {
        key: 'changed_by',
        namespace: 'common',
        translations: {
            tr: 'Değiştiren',
            en: 'Changed By'
        }
    },
    {
        key: 'changes',
        namespace: 'common',
        translations: {
            tr: 'Değişiklikler',
            en: 'Changes'
        }
    },
    {
        key: 'no_history_available',
        namespace: 'common',
        translations: {
            tr: 'Değişiklik geçmişi bulunmuyor',
            en: 'No change history available'
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
    },
    // Stepper bileşeni adım başlıkları
    {
        key: 'general_info',
        namespace: 'attributes',
        translations: {
            tr: 'Genel Bilgiler',
            en: 'General Information'
        }
    },
    {
        key: 'name_code_description',
        namespace: 'attributes',
        translations: {
            tr: 'İsim, kod, açıklama',
            en: 'Name, code, description'
        }
    },
    {
        key: 'type_selection',
        namespace: 'attributes',
        translations: {
            tr: 'Tip Seçimi',
            en: 'Type Selection'
        }
    },
    {
        key: 'attribute_type_and_requirement',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik tipi ve gerekliliği',
            en: 'Attribute type and requirement'
        }
    },
    {
        key: 'type_properties',
        namespace: 'attributes',
        translations: {
            tr: 'Tip Özellikleri',
            en: 'Type Properties'
        }
    },
    {
        key: 'type_specific_info',
        namespace: 'attributes',
        translations: {
            tr: 'Tipe özel bilgiler',
            en: 'Type specific information'
        }
    },
    {
        key: 'validation_rules',
        namespace: 'attributes',
        translations: {
            tr: 'Doğrulama Kuralları',
            en: 'Validation Rules'
        }
    },
    {
        key: 'validation_rules_desc',
        namespace: 'attributes',
        translations: {
            tr: 'Validasyon kuralları',
            en: 'Validation rules'
        }
    },
    {
        key: 'previous_step',
        namespace: 'attributes',
        translations: {
            tr: 'Önceki Adım',
            en: 'Previous Step'
        }
    },
    {
        key: 'next_step',
        namespace: 'attributes',
        translations: {
            tr: 'Sonraki Adım',
            en: 'Next Step'
        }
    },
    {
        key: 'create_attribute',
        namespace: 'attributes',
        translations: {
            tr: 'Özniteliği Oluştur',
            en: 'Create Attribute'
        }
    },
    {
        key: 'attribute_name',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik Adı',
            en: 'Attribute Name'
        }
    },
    {
        key: 'attribute_code',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik Kodu',
            en: 'Attribute Code'
        }
    },
    {
        key: 'is_required_description',
        namespace: 'attributes',
        translations: {
            tr: 'Bu öznitelik ürün oluşturulurken zorunlu olsun',
            en: 'This attribute is required when creating a product'
        }
    },
    {
        key: 'attribute_type',
        namespace: 'attributes',
        translations: {
            tr: 'Öznitelik Tipi',
            en: 'Attribute Type'
        }
    },
    {
        key: 'date_no_validation_confirm',
        namespace: 'attributes',
        translations: {
            tr: 'Tarih tipi için herhangi bir doğrulama kuralı belirtmediniz. Devam etmek istiyor musunuz?',
            en: 'You have not specified any validation rules for the date type. Do you want to continue?'
        }
    },
    {
        key: 'multiselect_no_validation_confirm',
        namespace: 'attributes',
        translations: {
            tr: 'Çoklu seçim tipi için seçim sayısı sınırlaması belirtmediniz. Devam etmek istiyor musunuz?',
            en: 'You have not specified a selection count limit for the multi-select type. Do you want to continue?'
        }
    },
    {
        key: 'select_optional',
        namespace: 'attributes',
        translations: {
            tr: 'Seçiniz (İsteğe bağlı)',
            en: 'Select (Optional)'
        }
    },
    {
        key: 'type_no_extra_properties',
        namespace: 'attributes',
        translations: {
            tr: 'tipi için ek özellik gerekmiyor.',
            en: 'type does not require additional properties.'
        }
    },
    {
        key: 'proceed_to_validation',
        namespace: 'attributes',
        translations: {
            tr: 'Bir sonraki adıma geçerek doğrulama kuralları tanımlayabilirsiniz.',
            en: 'You can define validation rules by proceeding to the next step.'
        }
    },
    {
        key: 'new_group',
        namespace: 'attributes',
        translations: {
            tr: 'Yeni Grup',
            en: 'New Group'
        }
    }
];
// Sistem ayarları çevirileri
const systemTranslations = [
    {
        key: 'system_settings',
        namespace: 'system',
        translations: {
            tr: 'Sistem Ayarları',
            en: 'System Settings'
        }
    },
    {
        key: 'system_settings_description',
        namespace: 'system',
        translations: {
            tr: 'Sistem ayarları ve yapılandırmalarını yönetin.',
            en: 'Manage system settings and configurations.'
        }
    },
    {
        key: 'general_settings',
        namespace: 'system',
        translations: {
            tr: 'Genel Ayarlar',
            en: 'General Settings'
        }
    },
    {
        key: 'security_settings',
        namespace: 'system',
        translations: {
            tr: 'Güvenlik Ayarları',
            en: 'Security Settings'
        }
    },
    {
        key: 'backup_restore',
        namespace: 'system',
        translations: {
            tr: 'Yedekleme ve Geri Yükleme',
            en: 'Backup & Restore'
        }
    },
    {
        key: 'integrations',
        namespace: 'system',
        translations: {
            tr: 'Entegrasyonlar',
            en: 'Integrations'
        }
    },
    {
        key: 'notifications',
        namespace: 'system',
        translations: {
            tr: 'Bildirimler',
            en: 'Notifications'
        }
    },
    {
        key: 'appearance_themes',
        namespace: 'system',
        translations: {
            tr: 'Görünüm ve Temalar',
            en: 'Appearance & Themes'
        }
    },
    {
        key: 'license_info',
        namespace: 'system',
        translations: {
            tr: 'Lisans Bilgileri',
            en: 'License Information'
        }
    },
    {
        key: 'save_settings',
        namespace: 'system',
        translations: {
            tr: 'Ayarları Kaydet',
            en: 'Save Settings'
        }
    },
    {
        key: 'company_name',
        namespace: 'system',
        translations: {
            tr: 'Şirket Adı',
            en: 'Company Name'
        }
    },
    {
        key: 'company_name_help',
        namespace: 'system',
        translations: {
            tr: 'Şirketinizin adı raporlarda ve sistem çıktılarında görünecektir.',
            en: 'Your company name will appear in reports and system outputs.'
        }
    },
    {
        key: 'system_title',
        namespace: 'system',
        translations: {
            tr: 'Sistem Başlığı',
            en: 'System Title'
        }
    },
    {
        key: 'system_title_help',
        namespace: 'system',
        translations: {
            tr: 'Tarayıcı başlığında ve panel üst kısmında görünecek başlık.',
            en: 'Title that will appear in browser title and panel header.'
        }
    },
    {
        key: 'default_language',
        namespace: 'system',
        translations: {
            tr: 'Varsayılan Dil',
            en: 'Default Language'
        }
    },
    {
        key: 'timezone',
        namespace: 'system',
        translations: {
            tr: 'Zaman Dilimi',
            en: 'Timezone'
        }
    },
    {
        key: 'date_format',
        namespace: 'system',
        translations: {
            tr: 'Tarih Formatı',
            en: 'Date Format'
        }
    },
    {
        key: 'time_format',
        namespace: 'system',
        translations: {
            tr: 'Saat Formatı',
            en: 'Time Format'
        }
    },
    {
        key: 'hour',
        namespace: 'common',
        translations: {
            tr: 'Saat',
            en: 'Hour'
        }
    },
    {
        key: 'system_information',
        namespace: 'system',
        translations: {
            tr: 'Sistem Bilgileri',
            en: 'System Information'
        }
    },
    {
        key: 'version',
        namespace: 'system',
        translations: {
            tr: 'Versiyon',
            en: 'Version'
        }
    },
    {
        key: 'install_date',
        namespace: 'system',
        translations: {
            tr: 'Kurulum Tarihi',
            en: 'Installation Date'
        }
    },
    {
        key: 'server_environment',
        namespace: 'system',
        translations: {
            tr: 'Sunucu Ortamı',
            en: 'Server Environment'
        }
    },
    {
        key: 'last_update',
        namespace: 'system',
        translations: {
            tr: 'Son Güncelleme',
            en: 'Last Update'
        }
    },
    // Security Settings
    {
        key: 'password_policy',
        namespace: 'system',
        translations: {
            tr: 'Şifre Politikası',
            en: 'Password Policy'
        }
    },
    {
        key: 'password_strength',
        namespace: 'system',
        translations: {
            tr: 'Şifre Gücü',
            en: 'Password Strength'
        }
    },
    {
        key: 'basic',
        namespace: 'system',
        translations: {
            tr: 'Basit',
            en: 'Basic'
        }
    },
    {
        key: 'medium',
        namespace: 'system',
        translations: {
            tr: 'Orta',
            en: 'Medium'
        }
    },
    {
        key: 'strong',
        namespace: 'system',
        translations: {
            tr: 'Güçlü',
            en: 'Strong'
        }
    },
    {
        key: 'very_strong',
        namespace: 'system',
        translations: {
            tr: 'Çok Güçlü',
            en: 'Very Strong'
        }
    },
    {
        key: 'characters',
        namespace: 'system',
        translations: {
            tr: 'karakter',
            en: 'characters'
        }
    },
    {
        key: 'letters_and_numbers',
        namespace: 'system',
        translations: {
            tr: 'harf ve rakamlar',
            en: 'letters and numbers'
        }
    },
    {
        key: 'mixed_case_numbers_symbols',
        namespace: 'system',
        translations: {
            tr: 'büyük-küçük harf, rakam ve semboller',
            en: 'mixed case, numbers and symbols'
        }
    },
    {
        key: 'password_strength_help',
        namespace: 'system',
        translations: {
            tr: 'Kullanıcıların şifreleri için gereken güvenlik seviyesini belirleyin.',
            en: 'Set the required security level for users passwords.'
        }
    },
    {
        key: 'password_expiration',
        namespace: 'system',
        translations: {
            tr: 'Şifre Son Kullanma Süresi',
            en: 'Password Expiration'
        }
    },
    {
        key: 'days',
        namespace: 'common',
        translations: {
            tr: 'gün',
            en: 'days'
        }
    },
    {
        key: 'password_expiration_help',
        namespace: 'system',
        translations: {
            tr: 'Şifrenin kaç gün sonra yenilenmesi gerektiğini belirleyin. 0 değeri, şifrelerin hiçbir zaman sona ermeyeceği anlamına gelir.',
            en: 'Set how many days until passwords need to be renewed. A value of 0 means passwords never expire.'
        }
    },
    {
        key: 'authentication',
        namespace: 'system',
        translations: {
            tr: 'Kimlik Doğrulama',
            en: 'Authentication'
        }
    },
    {
        key: 'enable_2fa',
        namespace: 'system',
        translations: {
            tr: 'İki Faktörlü Kimlik Doğrulamayı Etkinleştir',
            en: 'Enable Two-Factor Authentication'
        }
    },
    {
        key: '2fa_help',
        namespace: 'system',
        translations: {
            tr: 'Kullanıcılar, hesaplarına giriş yaparken bir doğrulama kodu girmelidir.',
            en: 'Users must enter a verification code when signing into their accounts.'
        }
    },
    {
        key: 'max_login_attempts',
        namespace: 'system',
        translations: {
            tr: 'Maksimum Giriş Denemeleri',
            en: 'Maximum Login Attempts'
        }
    },
    {
        key: 'login_attempts_help',
        namespace: 'system',
        translations: {
            tr: 'Hesap kilitlenmeden önce izin verilen başarısız giriş denemesi sayısı.',
            en: 'Number of failed login attempts allowed before the account is locked.'
        }
    },
    {
        key: 'session_settings',
        namespace: 'system',
        translations: {
            tr: 'Oturum Ayarları',
            en: 'Session Settings'
        }
    },
    {
        key: 'session_timeout',
        namespace: 'system',
        translations: {
            tr: 'Oturum Zaman Aşımı',
            en: 'Session Timeout'
        }
    },
    {
        key: 'minutes',
        namespace: 'common',
        translations: {
            tr: 'dakika',
            en: 'minutes'
        }
    },
    {
        key: 'session_timeout_help',
        namespace: 'system',
        translations: {
            tr: 'Kullanıcı hareketsiz kaldıktan sonra oturumun sonlandırılması için geçmesi gereken süre.',
            en: 'Time after which the session is terminated when the user is inactive.'
        }
    },
    {
        key: 'network_security',
        namespace: 'system',
        translations: {
            tr: 'Ağ Güvenliği',
            en: 'Network Security'
        }
    },
    {
        key: 'allowed_ips',
        namespace: 'system',
        translations: {
            tr: 'İzin Verilen IP Adresleri',
            en: 'Allowed IP Addresses'
        }
    },
    {
        key: 'allowed_ips_help',
        namespace: 'system',
        translations: {
            tr: 'Sisteme erişim sağlayabilecek IP adresleri veya CIDR aralıkları. Boş bırakırsanız tüm IP adreslerine izin verilir.',
            en: 'IP addresses or CIDR ranges that can access the system. Leave empty to allow all IP addresses.'
        }
    },
    {
        key: 'enforce_ssl',
        namespace: 'system',
        translations: {
            tr: 'SSL Bağlantısını Zorunlu Kıl',
            en: 'Enforce SSL Connection'
        }
    },
    {
        key: 'enforce_ssl_help',
        namespace: 'system',
        translations: {
            tr: 'Sisteme sadece güvenli HTTPS bağlantısı üzerinden erişime izin verir.',
            en: 'Only allows access to the system over secure HTTPS connection.'
        }
    },
    // Backup Settings
    {
        key: 'scheduled_backups',
        namespace: 'system',
        translations: {
            tr: 'Zamanlanmış Yedeklemeler',
            en: 'Scheduled Backups'
        }
    },
    {
        key: 'backup_frequency',
        namespace: 'system',
        translations: {
            tr: 'Yedekleme Sıklığı',
            en: 'Backup Frequency'
        }
    },
    {
        key: 'hourly',
        namespace: 'system',
        translations: {
            tr: 'Saatlik',
            en: 'Hourly'
        }
    },
    {
        key: 'daily',
        namespace: 'system',
        translations: {
            tr: 'Günlük',
            en: 'Daily'
        }
    },
    {
        key: 'weekly',
        namespace: 'system',
        translations: {
            tr: 'Haftalık',
            en: 'Weekly'
        }
    },
    {
        key: 'monthly',
        namespace: 'system',
        translations: {
            tr: 'Aylık',
            en: 'Monthly'
        }
    },
    {
        key: 'manual_only',
        namespace: 'system',
        translations: {
            tr: 'Sadece Manuel',
            en: 'Manual Only'
        }
    },
    {
        key: 'backup_time',
        namespace: 'system',
        translations: {
            tr: 'Yedekleme Zamanı',
            en: 'Backup Time'
        }
    },
    {
        key: 'backup_time_help',
        namespace: 'system',
        translations: {
            tr: 'Zamanlanmış yedeklemelerin başlatılacağı saat.',
            en: 'The hour when scheduled backups will start.'
        }
    },
    {
        key: 'retention_period',
        namespace: 'system',
        translations: {
            tr: 'Saklama Süresi',
            en: 'Retention Period'
        }
    },
    {
        key: 'retention_period_help',
        namespace: 'system',
        translations: {
            tr: 'Yedeklemelerin saklanacağı gün sayısı. Eski yedeklemeler otomatik olarak silinir.',
            en: 'Number of days backups will be kept. Older backups are automatically deleted.'
        }
    },
    {
        key: 'backup_storage',
        namespace: 'system',
        translations: {
            tr: 'Yedekleme Depolama',
            en: 'Backup Storage'
        }
    },
    {
        key: 'local_storage',
        namespace: 'system',
        translations: {
            tr: 'Yerel Depolama',
            en: 'Local Storage'
        }
    },
    {
        key: 'bucket_name',
        namespace: 'system',
        translations: {
            tr: 'Bucket Adı',
            en: 'Bucket Name'
        }
    },
    {
        key: 'region',
        namespace: 'system',
        translations: {
            tr: 'Bölge',
            en: 'Region'
        }
    },
    {
        key: 'backup_content',
        namespace: 'system',
        translations: {
            tr: 'Yedekleme İçeriği',
            en: 'Backup Content'
        }
    },
    {
        key: 'database',
        namespace: 'system',
        translations: {
            tr: 'Veritabanı',
            en: 'Database'
        }
    },
    {
        key: 'uploaded_files',
        namespace: 'system',
        translations: {
            tr: 'Yüklenen Dosyalar',
            en: 'Uploaded Files'
        }
    },
    {
        key: 'system_logs',
        namespace: 'system',
        translations: {
            tr: 'Sistem Logları',
            en: 'System Logs'
        }
    },
    {
        key: 'manual_operations',
        namespace: 'system',
        translations: {
            tr: 'Manuel İşlemler',
            en: 'Manual Operations'
        }
    },
    {
        key: 'create_backup_now',
        namespace: 'system',
        translations: {
            tr: 'Şimdi Yedekleme Oluştur',
            en: 'Create Backup Now'
        }
    },
    {
        key: 'manual_backup_help',
        namespace: 'system',
        translations: {
            tr: 'Mevcut sistem verilerinin bir yedeklemesini hemen oluşturun.',
            en: 'Create a backup of the current system data immediately.'
        }
    },
    {
        key: 'upload_backup_file',
        namespace: 'system',
        translations: {
            tr: 'Yedek Dosyasını Yükle',
            en: 'Upload Backup File'
        }
    },
    {
        key: 'restore_system',
        namespace: 'system',
        translations: {
            tr: 'Sistemi Geri Yükle',
            en: 'Restore System'
        }
    },
    {
        key: 'restore_warning',
        namespace: 'system',
        translations: {
            tr: 'Dikkat: Geri yükleme, mevcut verilerin üzerine yazacaktır. Bu işlem geri alınamaz.',
            en: 'Warning: Restoration will overwrite existing data. This action cannot be undone.'
        }
    },
    // Theme Settings
    {
        key: 'theme_settings',
        namespace: 'system',
        translations: {
            tr: 'Tema Ayarları',
            en: 'Theme Settings'
        }
    },
    {
        key: 'color_mode',
        namespace: 'system',
        translations: {
            tr: 'Renk Modu',
            en: 'Color Mode'
        }
    },
    {
        key: 'light_mode',
        namespace: 'system',
        translations: {
            tr: 'Açık Mod',
            en: 'Light Mode'
        }
    },
    {
        key: 'dark_mode',
        namespace: 'system',
        translations: {
            tr: 'Koyu Mod',
            en: 'Dark Mode'
        }
    },
    {
        key: 'system_preference',
        namespace: 'system',
        translations: {
            tr: 'Sistem Tercihi',
            en: 'System Preference'
        }
    },
    {
        key: 'enable_dark_mode_switch',
        namespace: 'system',
        translations: {
            tr: 'Koyu Mod Geçişini Etkinleştir',
            en: 'Enable Dark Mode Switch'
        }
    },
    {
        key: 'default_to_dark_mode',
        namespace: 'system',
        translations: {
            tr: 'Varsayılan Olarak Koyu Mod',
            en: 'Default to Dark Mode'
        }
    },
    {
        key: 'color_scheme',
        namespace: 'system',
        translations: {
            tr: 'Renk Şeması',
            en: 'Color Scheme'
        }
    },
    {
        key: 'primary_color',
        namespace: 'system',
        translations: {
            tr: 'Ana Renk',
            en: 'Primary Color'
        }
    },
    {
        key: 'accent_color',
        namespace: 'system',
        translations: {
            tr: 'Vurgu Rengi',
            en: 'Accent Color'
        }
    },
    {
        key: 'layout_settings',
        namespace: 'system',
        translations: {
            tr: 'Düzen Ayarları',
            en: 'Layout Settings'
        }
    },
    {
        key: 'menu_style',
        namespace: 'system',
        translations: {
            tr: 'Menü Stili',
            en: 'Menu Style'
        }
    },
    {
        key: 'side_menu',
        namespace: 'system',
        translations: {
            tr: 'Yan Menü',
            en: 'Side Menu'
        }
    },
    {
        key: 'top_menu',
        namespace: 'system',
        translations: {
            tr: 'Üst Menü',
            en: 'Top Menu'
        }
    },
    {
        key: 'collapsed_menu',
        namespace: 'system',
        translations: {
            tr: 'Daraltılmış Menü',
            en: 'Collapsed Menu'
        }
    },
    {
        key: 'show_logo',
        namespace: 'system',
        translations: {
            tr: 'Logo Göster',
            en: 'Show Logo'
        }
    },
    {
        key: 'show_user_avatar',
        namespace: 'system',
        translations: {
            tr: 'Kullanıcı Avatarını Göster',
            en: 'Show User Avatar'
        }
    },
    // Integration Settings
    {
        key: 'api_integration',
        namespace: 'system',
        translations: {
            tr: 'API Entegrasyonu',
            en: 'API Integration'
        }
    },
    {
        key: 'enable_public_api',
        namespace: 'system',
        translations: {
            tr: 'Herkese Açık API\'yi Etkinleştir',
            en: 'Enable Public API'
        }
    },
    {
        key: 'api_rate_limit',
        namespace: 'system',
        translations: {
            tr: 'API Hız Sınırı',
            en: 'API Rate Limit'
        }
    },
    {
        key: 'requests_per_hour',
        namespace: 'system',
        translations: {
            tr: 'saat başına istek',
            en: 'requests per hour'
        }
    },
    {
        key: 'api_keys',
        namespace: 'system',
        translations: {
            tr: 'API Anahtarları',
            en: 'API Keys'
        }
    },
    {
        key: 'api_keys_info',
        namespace: 'system',
        translations: {
            tr: 'API erişimi için kullanılan API anahtarlarını yönetin. Hassas bilgiler içerir, güvenli bir şekilde saklayın.',
            en: 'Manage API keys used for API access. Contains sensitive information, keep them secure.'
        }
    },
    {
        key: 'manage_api_keys',
        namespace: 'system',
        translations: {
            tr: 'API Anahtarlarını Yönet',
            en: 'Manage API Keys'
        }
    },
    {
        key: 'erp_integration',
        namespace: 'system',
        translations: {
            tr: 'ERP Entegrasyonu',
            en: 'ERP Integration'
        }
    },
    {
        key: 'erp_system',
        namespace: 'system',
        translations: {
            tr: 'ERP Sistemi',
            en: 'ERP System'
        }
    },
    {
        key: 'none',
        namespace: 'common',
        translations: {
            tr: 'Hiçbiri',
            en: 'None'
        }
    },
    {
        key: 'custom',
        namespace: 'system',
        translations: {
            tr: 'Özel',
            en: 'Custom'
        }
    },
    {
        key: 'connection_url',
        namespace: 'system',
        translations: {
            tr: 'Bağlantı URL\'si',
            en: 'Connection URL'
        }
    },
    {
        key: 'username',
        namespace: 'common',
        translations: {
            tr: 'Kullanıcı Adı',
            en: 'Username'
        }
    },
    {
        key: 'password',
        namespace: 'common',
        translations: {
            tr: 'Şifre',
            en: 'Password'
        }
    },
    {
        key: 'test_connection',
        namespace: 'system',
        translations: {
            tr: 'Bağlantıyı Test Et',
            en: 'Test Connection'
        }
    },
    {
        key: 'email_service',
        namespace: 'system',
        translations: {
            tr: 'E-posta Servisi',
            en: 'Email Service'
        }
    },
    {
        key: 'email_provider',
        namespace: 'system',
        translations: {
            tr: 'E-posta Sağlayıcısı',
            en: 'Email Provider'
        }
    },
    {
        key: 'sender_email',
        namespace: 'system',
        translations: {
            tr: 'Gönderen E-posta',
            en: 'Sender Email'
        }
    },
    {
        key: 'host',
        namespace: 'system',
        translations: {
            tr: 'Sunucu',
            en: 'Host'
        }
    },
    {
        key: 'language_selection_help',
        namespace: 'system',
        translations: {
            tr: 'Arayüz dilini değiştirmek için kullanabilirsiniz. Değişiklikler anında uygulanır.',
            en: 'Use this to change the interface language. Changes are applied immediately.'
        }
    },
    {
        key: 'default_language_help',
        namespace: 'system',
        translations: {
            tr: 'Yeni kullanıcılar için varsayılan olarak ayarlanan dil. Mevcut kullanıcıları etkilemez.',
            en: 'The language set as default for new users. Does not affect existing users.'
        }
    },
    {
        key: 'logo_settings',
        namespace: 'system',
        translations: {
            tr: 'Logo Ayarları',
            en: 'Logo Settings'
        }
    },
    {
        key: 'company_logo',
        namespace: 'system',
        translations: {
            tr: 'Şirket Logosu',
            en: 'Company Logo'
        }
    },
    {
        key: 'upload_logo',
        namespace: 'system',
        translations: {
            tr: 'Logo Yükle',
            en: 'Upload Logo'
        }
    },
    {
        key: 'logo_url',
        namespace: 'system',
        translations: {
            tr: 'Logo URL',
            en: 'Logo URL'
        }
    },
    {
        key: 'logo_help',
        namespace: 'system',
        translations: {
            tr: 'Logo için bir URL girin veya bilgisayarınızdan bir dosya yükleyin.',
            en: 'Enter a URL for your logo or upload a file from your computer.'
        }
    },
    {
        key: 'logo_requirements',
        namespace: 'system',
        translations: {
            tr: 'Logo Gereksinimleri',
            en: 'Logo Requirements'
        }
    },
    {
        key: 'logo_size_recommendation',
        namespace: 'system',
        translations: {
            tr: 'Önerilen boyut: 200x200 piksel veya daha büyük, kare oranında',
            en: 'Recommended size: 200x200 pixels or larger, square ratio'
        }
    },
    {
        key: 'logo_format_support',
        namespace: 'system',
        translations: {
            tr: 'Desteklenen formatlar: PNG, JPG, SVG',
            en: 'Supported formats: PNG, JPG, SVG'
        }
    },
    {
        key: 'logo_transparent_recommendation',
        namespace: 'system',
        translations: {
            tr: 'Şeffaf arka planlı PNG önerilir',
            en: 'PNG with transparent background recommended'
        }
    },
    {
        key: 'company_name_help',
        namespace: 'system',
        translations: {
            tr: 'Şirketinizin tam adı. Yasal dokümanlarda ve başlıklarda kullanılacaktır.',
            en: 'Your company\'s full name. This will be used in legal documents and headings.'
        }
    },
    {
        key: 'system_title_help',
        namespace: 'system',
        translations: {
            tr: 'Tarayıcı sekmesinde ve başlıkta görünecek isim.',
            en: 'The name that will appear in the browser tab and header.'
        }
    },
    {
        key: 'language_selection_help',
        namespace: 'system',
        translations: {
            tr: 'Bu, sistemin varsayılan dilidir. Kullanıcılar kendi tercihlerini ayarlayabilir.',
            en: 'This is the default language of the system. Users can set their own preferences.'
        }
    },
    {
        key: 'error_occurred',
        namespace: 'system',
        translations: {
            tr: 'Bir Hata Oluştu',
            en: 'An Error Occurred'
        }
    },
    {
        key: 'try_again',
        namespace: 'system',
        translations: {
            tr: 'Tekrar Dene',
            en: 'Try Again'
        }
    },
    {
        key: 'saving',
        namespace: 'common',
        translations: {
            tr: 'Kaydediliyor',
            en: 'Saving'
        }
    },
    {
        key: 'settings_saved',
        namespace: 'system',
        translations: {
            tr: 'Ayarlar kaydedildi',
            en: 'Settings saved'
        }
    },
    {
        key: 'settings_save_error',
        namespace: 'system',
        translations: {
            tr: 'Ayarlar kaydedilirken hata oluştu',
            en: 'Error saving settings'
        }
    },
    {
        key: 'logout',
        namespace: 'common',
        translations: {
            tr: 'Çıkış Yap',
            en: 'Logout'
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
        key: 'open_user_menu',
        namespace: 'nav',
        translations: {
            tr: 'Kullanıcı Menüsünü Aç',
            en: 'Open User Menu'
        }
    },
    // AttributeGroup çevirileri
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
    // Attribute types namespace çevirileri
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
            en: 'Multiselect'
        }
    },
    {
        key: 'text_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Tek satır veya çok satırlı metin girilebilir.',
            en: 'Enter single-line or multi-line text.'
        }
    },
    {
        key: 'number_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Tam sayı veya ondalıklı sayı girilebilir.',
            en: 'Enter an integer or decimal number.'
        }
    },
    {
        key: 'date_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Tarih bilgisi seçilebilir.',
            en: 'Select a date.'
        }
    },
    {
        key: 'boolean_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Evet veya hayır değeri seçilebilir.',
            en: 'Select yes or no value.'
        }
    },
    {
        key: 'select_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Önceden tanımlanmış seçeneklerden birisi seçilebilir.',
            en: 'Select one from predefined options.'
        }
    },
    {
        key: 'multiselect_type_description',
        namespace: 'attribute_types',
        translations: {
            tr: 'Önceden tanımlanmış seçeneklerden birden fazlası seçilebilir.',
            en: 'Select multiple from predefined options.'
        }
    },
    // Ekstra öznitelik tipleri
    {
        key: 'category_id',
        namespace: 'attribute_types',
        translations: {
            tr: 'Kategori',
            en: 'Category'
        }
    },
    {
        key: 'brand_id',
        namespace: 'attribute_types',
        translations: {
            tr: 'Marka',
            en: 'Brand'
        }
    },
    {
        key: 'product_id',
        namespace: 'attribute_types',
        translations: {
            tr: 'Ürün',
            en: 'Product'
        }
    },
    // Yeni eklenen sistem ayarları sayfaları çevirileri
    {
        key: 'backup_settings',
        namespace: 'system',
        translations: {
            tr: 'Yedekleme Ayarları',
            en: 'Backup Settings'
        }
    },
    {
        key: 'backup_now',
        namespace: 'system',
        translations: {
            tr: 'Şimdi Yedekle',
            en: 'Backup Now'
        }
    },
    {
        key: 'backup_in_progress',
        namespace: 'system',
        translations: {
            tr: 'Yedekleniyor...',
            en: 'Backup in Progress...'
        }
    },
    {
        key: 'low',
        namespace: 'system',
        translations: {
            tr: 'Düşük',
            en: 'Low'
        }
    },
    {
        key: 'medium',
        namespace: 'system',
        translations: {
            tr: 'Orta',
            en: 'Medium'
        }
    },
    {
        key: 'high',
        namespace: 'system',
        translations: {
            tr: 'Yüksek',
            en: 'High'
        }
    },
    {
        key: 'logo_settings',
        namespace: 'system',
        translations: {
            tr: 'Logo Ayarları',
            en: 'Logo Settings'
        }
    },
    {
        key: 'upload_logo',
        namespace: 'system',
        translations: {
            tr: 'Logo Yükle',
            en: 'Upload Logo'
        }
    },
    {
        key: 'logo_url',
        namespace: 'system',
        translations: {
            tr: 'Logo URL',
            en: 'Logo URL'
        }
    },
    {
        key: 'logo_help',
        namespace: 'system',
        translations: {
            tr: 'Uzak bir sunucudan logo URL\'si kullanabilir veya kendi logonuzu yükleyebilirsiniz.',
            en: 'You can use a logo URL from a remote server or upload your own logo.'
        }
    },
    {
        key: 'logo_requirements',
        namespace: 'system',
        translations: {
            tr: 'Logo Gereksinimleri',
            en: 'Logo Requirements'
        }
    },
    {
        key: 'logo_size_recommendation',
        namespace: 'system',
        translations: {
            tr: 'Önerilen boyutlar: 200x60 piksel',
            en: 'Recommended dimensions: 200x60 pixels'
        }
    },
    {
        key: 'logo_format_support',
        namespace: 'system',
        translations: {
            tr: 'PNG, JPG, SVG formatları desteklenir',
            en: 'PNG, JPG, SVG formats are supported'
        }
    },
    {
        key: 'logo_transparent_recommendation',
        namespace: 'system',
        translations: {
            tr: 'Şeffaf arka planlı bir PNG tavsiye edilir',
            en: 'A PNG with transparent background is recommended'
        }
    },
    {
        key: 'company_name_help',
        namespace: 'system',
        translations: {
            tr: 'Şirketinizin tam adı. Yasal dokümanlarda ve başlıklarda kullanılacaktır.',
            en: 'Your company\'s full name. This will be used in legal documents and headings.'
        }
    },
    {
        key: 'system_title_help',
        namespace: 'system',
        translations: {
            tr: 'Tarayıcı sekmesinde ve başlıkta görünecek isim.',
            en: 'The name that will appear in the browser tab and header.'
        }
    },
    {
        key: 'language_selection_help',
        namespace: 'system',
        translations: {
            tr: 'Bu, sistemin varsayılan dilidir. Kullanıcılar kendi tercihlerini ayarlayabilir.',
            en: 'This is the default language of the system. Users can set their own preferences.'
        }
    },
    {
        key: 'error_occurred',
        namespace: 'system',
        translations: {
            tr: 'Bir Hata Oluştu',
            en: 'An Error Occurred'
        }
    },
    {
        key: 'try_again',
        namespace: 'system',
        translations: {
            tr: 'Tekrar Dene',
            en: 'Try Again'
        }
    },
    {
        key: 'saving',
        namespace: 'common',
        translations: {
            tr: 'Kaydediliyor',
            en: 'Saving'
        }
    },
    {
        key: 'settings_saved',
        namespace: 'system',
        translations: {
            tr: 'Ayarlar kaydedildi',
            en: 'Settings saved'
        }
    },
    {
        key: 'settings_save_error',
        namespace: 'system',
        translations: {
            tr: 'Ayarlar kaydedilirken hata oluştu',
            en: 'Error saving settings'
        }
    },
    {
        key: 'logout',
        namespace: 'common',
        translations: {
            tr: 'Çıkış Yap',
            en: 'Logout'
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
        key: 'open_user_menu',
        namespace: 'nav',
        translations: {
            tr: 'Kullanıcı Menüsünü Aç',
            en: 'Open User Menu'
        }
    }
];
// Çevirileri ekle
const seedLocalizations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Önce koleksiyonu temizle
        console.log('Mevcut çeviriler silindi');
        // Tüm çevirileri birleştir
        const allTranslations = [
            ...commonTranslations,
            ...productTranslations,
            ...errorTranslations,
            ...attributeTranslations,
            ...systemTranslations, // Yeni eklenen sistem çevirileri
            // Profil çevirileri
            {
                key: 'profile',
                namespace: 'profile',
                translations: {
                    tr: 'Profil',
                    en: 'Profile'
                }
            },
            {
                key: 'profile_information',
                namespace: 'profile',
                translations: {
                    tr: 'Profil Bilgileri',
                    en: 'Profile Information'
                }
            },
            {
                key: 'name',
                namespace: 'profile',
                translations: {
                    tr: 'Ad',
                    en: 'Name'
                }
            },
            {
                key: 'email',
                namespace: 'profile',
                translations: {
                    tr: 'E-posta',
                    en: 'Email'
                }
            },
            {
                key: 'role',
                namespace: 'profile',
                translations: {
                    tr: 'Rol',
                    en: 'Role'
                }
            },
            // Menü çevirileri
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
            // Tema çevirileri
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
            },
            // Auth çevirileri
            {
                key: 'welcome_back',
                namespace: 'auth',
                translations: {
                    tr: 'Tekrar Hoşgeldiniz',
                    en: 'Welcome Back'
                }
            },
            {
                key: 'login_subtitle',
                namespace: 'auth',
                translations: {
                    tr: 'SpesEngine\'e giriş yapmak için bilgilerinizi girin',
                    en: 'Enter your credentials to access SpesEngine'
                }
            },
            {
                key: 'email',
                namespace: 'auth',
                translations: {
                    tr: 'E-posta',
                    en: 'Email'
                }
            },
            {
                key: 'email_placeholder',
                namespace: 'auth',
                translations: {
                    tr: 'E-posta adresinizi girin',
                    en: 'Enter your email address'
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
                key: 'password_placeholder',
                namespace: 'auth',
                translations: {
                    tr: 'Şifrenizi girin',
                    en: 'Enter your password'
                }
            },
            {
                key: 'remember_me',
                namespace: 'auth',
                translations: {
                    tr: 'Beni Hatırla',
                    en: 'Remember Me'
                }
            },
            {
                key: 'forgot_password',
                namespace: 'auth',
                translations: {
                    tr: 'Şifremi Unuttum',
                    en: 'Forgot Password'
                }
            },
            {
                key: 'login_button',
                namespace: 'auth',
                translations: {
                    tr: 'Giriş Yap',
                    en: 'Sign In'
                }
            },
            {
                key: 'dont_have_account',
                namespace: 'auth',
                translations: {
                    tr: 'Hesabınız yok mu?',
                    en: 'Don\'t have an account?'
                }
            },
            {
                key: 'register_now',
                namespace: 'auth',
                translations: {
                    tr: 'Hemen Kaydolun',
                    en: 'Register Now'
                }
            },
            // Navigasyon çevirileri
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
            },
            // Doğrulama çevirileri
            {
                key: 'no_validation_rules_yet',
                namespace: 'validation',
                translations: {
                    tr: 'Henüz doğrulama kuralı belirlemediniz',
                    en: 'You have not yet defined any validation rules'
                }
            },
            {
                key: 'min_length',
                namespace: 'validation',
                translations: {
                    tr: 'Minimum Uzunluk',
                    en: 'Minimum Length'
                }
            },
            {
                key: 'max_length',
                namespace: 'validation',
                translations: {
                    tr: 'Maksimum Uzunluk',
                    en: 'Maximum Length'
                }
            },
            {
                key: 'pattern',
                namespace: 'validation',
                translations: {
                    tr: 'Desen (Regex)',
                    en: 'Pattern (Regex)'
                }
            },
            // Durum çevirileri
            {
                key: 'active',
                namespace: 'status',
                translations: {
                    tr: 'Aktif',
                    en: 'Active'
                }
            },
            {
                key: 'inactive',
                namespace: 'status',
                translations: {
                    tr: 'Pasif',
                    en: 'Inactive'
                }
            },
            {
                key: 'pending',
                namespace: 'status',
                translations: {
                    tr: 'Beklemede',
                    en: 'Pending'
                }
            },
            {
                key: 'archived',
                namespace: 'status',
                translations: {
                    tr: 'Arşivlenmiş',
                    en: 'Archived'
                }
            },
            // İlişkiler çevirileri
            {
                key: 'relationships',
                namespace: 'relationships',
                translations: {
                    tr: 'İlişkiler',
                    en: 'Relationships'
                }
            },
            {
                key: 'relationship_types',
                namespace: 'relationships',
                translations: {
                    tr: 'İlişki Tipleri',
                    en: 'Relationship Types'
                }
            },
            {
                key: 'directional',
                namespace: 'relationships',
                translations: {
                    tr: 'Yönlü',
                    en: 'Directional'
                }
            },
            {
                key: 'source_types',
                namespace: 'relationships',
                translations: {
                    tr: 'Kaynak Tipleri',
                    en: 'Source Types'
                }
            },
            {
                key: 'target_types',
                namespace: 'relationships',
                translations: {
                    tr: 'Hedef Tipleri',
                    en: 'Target Types'
                }
            },
            // AttributeGroup çevirileri
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
            // Attribute types namespace çevirileri
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
                    en: 'Multiselect'
                }
            },
            {
                key: 'text_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Tek satır veya çok satırlı metin girilebilir.',
                    en: 'Enter single-line or multi-line text.'
                }
            },
            {
                key: 'number_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Tam sayı veya ondalıklı sayı girilebilir.',
                    en: 'Enter an integer or decimal number.'
                }
            },
            {
                key: 'date_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Tarih bilgisi seçilebilir.',
                    en: 'Select a date.'
                }
            },
            {
                key: 'boolean_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Evet veya hayır değeri seçilebilir.',
                    en: 'Select yes or no value.'
                }
            },
            {
                key: 'select_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Önceden tanımlanmış seçeneklerden birisi seçilebilir.',
                    en: 'Select one from predefined options.'
                }
            },
            {
                key: 'multiselect_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Önceden tanımlanmış seçeneklerden birden fazlası seçilebilir.',
                    en: 'Select multiple from predefined options.'
                }
            },
            // Ekstra öznitelik tipleri
            {
                key: 'category_id',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Kategori',
                    en: 'Category'
                }
            },
            {
                key: 'brand_id',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Marka',
                    en: 'Brand'
                }
            },
            {
                key: 'product_id',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Ürün',
                    en: 'Product'
                }
            },
            // Yeni eklenen sistem ayarları sayfaları çevirileri
            {
                key: 'backup_settings',
                namespace: 'system',
                translations: {
                    tr: 'Yedekleme Ayarları',
                    en: 'Backup Settings'
                }
            },
            {
                key: 'backup_now',
                namespace: 'system',
                translations: {
                    tr: 'Şimdi Yedekle',
                    en: 'Backup Now'
                }
            },
            {
                key: 'backup_in_progress',
                namespace: 'system',
                translations: {
                    tr: 'Yedekleniyor...',
                    en: 'Backup in Progress...'
                }
            },
            {
                key: 'low',
                namespace: 'system',
                translations: {
                    tr: 'Düşük',
                    en: 'Low'
                }
            },
            {
                key: 'medium',
                namespace: 'system',
                translations: {
                    tr: 'Orta',
                    en: 'Medium'
                }
            },
            {
                key: 'high',
                namespace: 'system',
                translations: {
                    tr: 'Yüksek',
                    en: 'High'
                }
            },
            {
                key: 'logo_settings',
                namespace: 'system',
                translations: {
                    tr: 'Logo Ayarları',
                    en: 'Logo Settings'
                }
            },
            {
                key: 'upload_logo',
                namespace: 'system',
                translations: {
                    tr: 'Logo Yükle',
                    en: 'Upload Logo'
                }
            },
            {
                key: 'logo_url',
                namespace: 'system',
                translations: {
                    tr: 'Logo URL',
                    en: 'Logo URL'
                }
            },
            {
                key: 'logo_help',
                namespace: 'system',
                translations: {
                    tr: 'Uzak bir sunucudan logo URL\'si kullanabilir veya kendi logonuzu yükleyebilirsiniz.',
                    en: 'You can use a logo URL from a remote server or upload your own logo.'
                }
            },
            {
                key: 'logo_requirements',
                namespace: 'system',
                translations: {
                    tr: 'Logo Gereksinimleri',
                    en: 'Logo Requirements'
                }
            },
            {
                key: 'logo_size_recommendation',
                namespace: 'system',
                translations: {
                    tr: 'Önerilen boyutlar: 200x60 piksel',
                    en: 'Recommended dimensions: 200x60 pixels'
                }
            },
            {
                key: 'logo_format_support',
                namespace: 'system',
                translations: {
                    tr: 'PNG, JPG, SVG formatları desteklenir',
                    en: 'PNG, JPG, SVG formats are supported'
                }
            },
            {
                key: 'logo_transparent_recommendation',
                namespace: 'system',
                translations: {
                    tr: 'Şeffaf arka planlı bir PNG tavsiye edilir',
                    en: 'A PNG with transparent background is recommended'
                }
            },
            {
                key: 'company_name_help',
                namespace: 'system',
                translations: {
                    tr: 'Şirketinizin tam adı. Yasal dokümanlarda ve başlıklarda kullanılacaktır.',
                    en: 'Your company\'s full name. This will be used in legal documents and headings.'
                }
            },
            {
                key: 'system_title_help',
                namespace: 'system',
                translations: {
                    tr: 'Tarayıcı sekmesinde ve başlıkta görünecek isim.',
                    en: 'The name that will appear in the browser tab and header.'
                }
            },
            {
                key: 'language_selection_help',
                namespace: 'system',
                translations: {
                    tr: 'Bu, sistemin varsayılan dilidir. Kullanıcılar kendi tercihlerini ayarlayabilir.',
                    en: 'This is the default language of the system. Users can set their own preferences.'
                }
            },
            {
                key: 'error_occurred',
                namespace: 'system',
                translations: {
                    tr: 'Bir Hata Oluştu',
                    en: 'An Error Occurred'
                }
            },
            {
                key: 'try_again',
                namespace: 'system',
                translations: {
                    tr: 'Tekrar Dene',
                    en: 'Try Again'
                }
            },
            {
                key: 'saving',
                namespace: 'common',
                translations: {
                    tr: 'Kaydediliyor',
                    en: 'Saving'
                }
            },
            {
                key: 'settings_saved',
                namespace: 'system',
                translations: {
                    tr: 'Ayarlar kaydedildi',
                    en: 'Settings saved'
                }
            },
            {
                key: 'settings_save_error',
                namespace: 'system',
                translations: {
                    tr: 'Ayarlar kaydedilirken hata oluştu',
                    en: 'Error saving settings'
                }
            },
            {
                key: 'logout',
                namespace: 'common',
                translations: {
                    tr: 'Çıkış Yap',
                    en: 'Logout'
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
                key: 'open_user_menu',
                namespace: 'nav',
                translations: {
                    tr: 'Kullanıcı Menüsünü Aç',
                    en: 'Open User Menu'
                }
            },
            // AttributeGroup çevirileri
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
            // Attribute types namespace çevirileri
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
                    en: 'Multiselect'
                }
            },
            {
                key: 'text_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Tek satır veya çok satırlı metin girilebilir.',
                    en: 'Enter single-line or multi-line text.'
                }
            },
            {
                key: 'number_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Tam sayı veya ondalıklı sayı girilebilir.',
                    en: 'Enter an integer or decimal number.'
                }
            },
            {
                key: 'date_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Tarih bilgisi seçilebilir.',
                    en: 'Select a date.'
                }
            },
            {
                key: 'boolean_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Evet veya hayır değeri seçilebilir.',
                    en: 'Select yes or no value.'
                }
            },
            {
                key: 'select_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Önceden tanımlanmış seçeneklerden birisi seçilebilir.',
                    en: 'Select one from predefined options.'
                }
            },
            {
                key: 'multiselect_type_description',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Önceden tanımlanmış seçeneklerden birden fazlası seçilebilir.',
                    en: 'Select multiple from predefined options.'
                }
            },
            // Ekstra öznitelik tipleri
            {
                key: 'category_id',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Kategori',
                    en: 'Category'
                }
            },
            {
                key: 'brand_id',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Marka',
                    en: 'Brand'
                }
            },
            {
                key: 'product_id',
                namespace: 'attribute_types',
                translations: {
                    tr: 'Ürün',
                    en: 'Product'
                }
            }
        ];
        // Her çeviriyi ekle
        for (const translation of allTranslations) {
            const { key, namespace = 'common', translations } = translation;
            console.log(`Çeviri ekleniyor: ${namespace}:${key}`);
            yield localizationService_1.default.upsertTranslation({
                key,
                namespace,
                translations
            });
        }
        console.log(`${allTranslations.length} çeviri başarıyla eklendi`);
        process.exit(0);
    }
    catch (error) {
        console.error('Hata oluştu:', error);
        process.exit(1);
    }
});
// Script'i çalıştır
seedLocalizations();
