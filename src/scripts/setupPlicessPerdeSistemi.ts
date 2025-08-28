import mongoose from 'mongoose';
import Attribute from '../models/Attribute';
import AttributeGroup from '../models/AttributeGroup';
import Category from '../models/Category';
import Family from '../models/Family';
import ItemType from '../models/ItemType';
import localizationService from '../services/localizationService';

/**
 * Plicess Perde Üretim Sistemi Setup Script
 * 
 * Bu script aşağıdaki yapıları kurar:
 * 1. ItemType'lar: Müşteri, Stok, Sipariş
 * 2. Kategoriler: Stok Çeşitleri, Sipariş Çeşitleri
 * 3. Aileler: Kumaş Serileri, Kasa Renkleri
 * 4. Attribute Groups ve Attributes
 */

async function setupPlicessPerdeSistemi() {
  try {
    console.log('🎨 Plicess Perde Üretim Sistemi Kurulumu Başlatılıyor...');

    // MongoDB bağlantısı kontrolü
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/spesengine');
      console.log('📊 MongoDB bağlantısı başarılı');
    }

    // 1. Mevcut verileri temizle
    console.log('🧹 Mevcut veriler temizleniyor...');
    await ItemType.deleteMany({});
    await Category.deleteMany({});
    await Family.deleteMany({});
    await AttributeGroup.deleteMany({});
    await Attribute.deleteMany({});
    console.log('✅ Mevcut veriler temizlendi');

    // ===========================================
    // 1. ATTRIBUTES (En temel seviye)
    // ===========================================
    console.log('📝 Attributes oluşturuluyor...');
    
    const attributeDefinitions = [
      // Kişi Bilgileri Grubu
      {
        nameTranslations: { tr: 'Kişi Adı', en: 'First Name' },
        code: 'first_name',
        descriptionTranslations: { tr: 'Kişinin adı', en: 'Person first name' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Soy Adı', en: 'Last Name' },
        code: 'last_name',
        descriptionTranslations: { tr: 'Kişinin soyadı', en: 'Person last name' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Telefon', en: 'Phone' },
        code: 'phone',
        descriptionTranslations: { tr: 'Telefon numarası', en: 'Phone number' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Email', en: 'Email' },
        code: 'email',
        descriptionTranslations: { tr: 'E-posta adresi', en: 'Email address' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Doğum Günü', en: 'Birthday' },
        code: 'birthday',
        descriptionTranslations: { tr: 'Doğum tarihi', en: 'Birth date' },
        type: 'date',
        isRequired: false,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Adres', en: 'Address' },
        code: 'address',
        descriptionTranslations: { tr: 'Tam adres bilgisi', en: 'Full address information' },
        type: 'text',
        isRequired: true,
        isActive: true
      },

      // Sosyal Medya Bilgileri Grubu
      {
        nameTranslations: { tr: 'Instagram', en: 'Instagram' },
        code: 'instagram',
        descriptionTranslations: { tr: 'Instagram kullanıcı adı', en: 'Instagram username' },
        type: 'text',
        isRequired: false,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Facebook', en: 'Facebook' },
        code: 'facebook',
        descriptionTranslations: { tr: 'Facebook kullanıcı adı', en: 'Facebook username' },
        type: 'text',
        isRequired: false,
        isActive: true
      },

      // Dükkan Bilgileri Grubu
      {
        nameTranslations: { tr: 'Mağaza Adı', en: 'Store Name' },
        code: 'store_name',
        descriptionTranslations: { tr: 'Mağazanın adı', en: 'Name of the store' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Konumu', en: 'Location' },
        code: 'location',
        descriptionTranslations: { tr: 'Mağaza konumu', en: 'Store location' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Adresi', en: 'Store Address' },
        code: 'store_address',
        descriptionTranslations: { tr: 'Mağaza adresi', en: 'Store address' },
        type: 'text',
        isRequired: true,
        isActive: true
      },

      // Sipariş Sahibi Bilgileri Grubu
      {
        nameTranslations: { tr: 'Adı', en: 'Order Owner Name' },
        code: 'order_owner_name',
        descriptionTranslations: { tr: 'Sipariş sahibinin adı', en: 'Order owner name' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Soyadı', en: 'Order Owner Surname' },
        code: 'order_owner_surname',
        descriptionTranslations: { tr: 'Sipariş sahibinin soyadı', en: 'Order owner surname' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'İl', en: 'Province' },
        code: 'province',
        descriptionTranslations: { tr: 'İl bilgisi', en: 'Province information' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'İlçe', en: 'District' },
        code: 'district',
        descriptionTranslations: { tr: 'İlçe bilgisi', en: 'District information' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Telefon', en: 'Order Phone' },
        code: 'order_phone',
        descriptionTranslations: { tr: 'Sipariş sahibi telefon numarası', en: 'Order owner phone number' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Adres', en: 'Order Address' },
        code: 'order_address',
        descriptionTranslations: { tr: 'Sipariş sahibi adresi', en: 'Order owner address' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Not', en: 'Note' },
        code: 'note',
        descriptionTranslations: { tr: 'Sipariş notu', en: 'Order note' },
        type: 'text',
        isRequired: false,
        isActive: true
      },

      // Stok Grubu
      {
        nameTranslations: { tr: 'Stok No', en: 'Stock Number' },
        code: 'stock_no',
        descriptionTranslations: { tr: 'Stok numarası', en: 'Stock number' },
        type: 'text',
        isRequired: true,
        isActive: true
      },

      // Kumaş Özellikleri Grubu
      {
        nameTranslations: { tr: 'Genişlik', en: 'Width' },
        code: 'fabric_width',
        descriptionTranslations: { tr: 'Kumaş genişliği (cm)', en: 'Fabric width (cm)' },
        type: 'number',
        validations: { min: 0, max: 500 },
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Uzunluk', en: 'Length' },
        code: 'fabric_length',
        descriptionTranslations: { tr: 'Kumaş uzunluğu (metre)', en: 'Fabric length (meters)' },
        type: 'number',
        validations: { min: 0, max: 1000 },
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Katlama Sayısı', en: 'Fold Count' },
        code: 'fold_count',
        descriptionTranslations: { tr: 'Kumaşın katlanma sayısı', en: 'Number of fabric folds' },
        type: 'number',
        validations: { min: 1, max: 10 },
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Metrekare', en: 'Square Meter' },
        code: 'square_meter',
        descriptionTranslations: { tr: 'Toplam kumaş alanı (m²)', en: 'Total fabric area (m²)' },
        type: 'number',
        validations: { min: 0, max: 1000 },
        isRequired: false,
        isActive: true
      },

      // Kasa Özellikleri Grubu
      {
        nameTranslations: { tr: 'Bağ', en: 'Connection' },
        code: 'case_connection',
        descriptionTranslations: { tr: 'Kasa bağlantı özelliği', en: 'Case connection property' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Uzunluk', en: 'Case Length' },
        code: 'case_length',
        descriptionTranslations: { tr: 'Kasa uzunluğu', en: 'Case length' },
        type: 'number',
        validations: { min: 0, max: 1000 },
        isRequired: true,
        isActive: true
      },

      // Şerit Özellikleri Grubu
      {
        nameTranslations: { tr: 'Renk', en: 'Strip Color' },
        code: 'strip_color',
        descriptionTranslations: { tr: 'Şerit rengi', en: 'Strip color' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Kalınlık', en: 'Thickness' },
        code: 'strip_thickness',
        descriptionTranslations: { tr: 'Şerit kalınlığı', en: 'Strip thickness' },
        type: 'number',
        validations: { min: 0, max: 100 },
        isRequired: true,
        isActive: true
      },

      // İp Özellikleri Grubu
      {
        nameTranslations: { tr: 'Renk', en: 'Thread Color' },
        code: 'thread_color',
        descriptionTranslations: { tr: 'İp rengi', en: 'Thread color' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Uzunluk', en: 'Thread Length' },
        code: 'thread_length',
        descriptionTranslations: { tr: 'İp uzunluğu', en: 'Thread length' },
        type: 'number',
        validations: { min: 0, max: 1000 },
        isRequired: true,
        isActive: true
      },

      // Kapak Özellikleri Grubu
      {
        nameTranslations: { tr: 'Renk', en: 'Cover Color' },
        code: 'cover_color',
        descriptionTranslations: { tr: 'Kapak rengi', en: 'Cover color' },
        type: 'text',
        isRequired: true,
        isActive: true
      },

      // Kilit Özellikleri Grubu
      {
        nameTranslations: { tr: 'Renk', en: 'Lock Color' },
        code: 'lock_color',
        descriptionTranslations: { tr: 'Kilit rengi', en: 'Lock color' },
        type: 'text',
        isRequired: true,
        isActive: true
      },

      // Sipariş Grubu
      {
        nameTranslations: { tr: 'Sipariş Tarihi', en: 'Order Date' },
        code: 'order_date',
        descriptionTranslations: { tr: 'Siparişin verildiği tarih', en: 'Date when order was placed' },
        type: 'date',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Sipariş No', en: 'Order Number' },
        code: 'order_number',
        descriptionTranslations: { tr: 'Sipariş numarası', en: 'Order number' },
        type: 'text',
        isRequired: true,
        isActive: true
      },
      {
        nameTranslations: { tr: 'Sipariş Durumu', en: 'Order Status' },
        code: 'order_status',
        descriptionTranslations: { tr: 'Siparişin mevcut durumu', en: 'Current status of the order' },
        type: 'select',
        options: [
          { value: 'siparis_alindi', label: { tr: 'Sipariş Alındı', en: 'Order Received' } },
          { value: 'kumas_bekleniyor', label: { tr: 'Kumaş Bekleniyor', en: 'Waiting for Fabric' } },
          { value: 'kumas_kesildi', label: { tr: 'Kumaş Kesildi', en: 'Fabric Cut' } },
          { value: 'delindi', label: { tr: 'Delindi', en: 'Perforated' } },
          { value: 'kusgozü_atildi', label: { tr: 'Kuş Gözü Atıldı', en: 'Eyelets Applied' } },
          { value: 'iplendi', label: { tr: 'İplendi', en: 'Threaded' } },
          { value: 'paketlendi', label: { tr: 'Paketlendi', en: 'Packaged' } },
          { value: 'gonderildi', label: { tr: 'Gönderildi', en: 'Shipped' } }
        ],
        isRequired: true,
        isActive: true
      },

      // Tekli Sistem Sipariş Grubu
      {
        nameTranslations: { tr: 'Ölçüler', en: 'Measurements' },
        code: 'measurements',
        descriptionTranslations: { tr: 'Perde ölçüleri tablosu', en: 'Curtain measurements table' },
        type: 'table',
        validations: {
          columns: [
            { name: 'Genişlik', type: 'number', width: 120 },
            { name: 'Yükseklik', type: 'number', width: 120 },
            { name: 'Birim', type: 'select', options: ['cm', 'm'], width: 80 },
            { name: 'Adet', type: 'number', width: 80 },
            { name: 'Not', type: 'text', width: 200 }
          ],
          minRows: 1,
          maxRows: 10,
          allowAddRows: true,
          allowDeleteRows: true,
          allowEditRows: true
        },
        isRequired: true,
        isActive: true
      }
    ];

    const createdAttributes: any[] = [];
    for (const attrDef of attributeDefinitions) {
      try {
        // Name için localization oluştur
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${attrDef.code}_name`,
          namespace: 'attributes',
          translations: attrDef.nameTranslations
        });

        // Description için localization oluştur
        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${attrDef.code}_description`,
          namespace: 'attributes',
          translations: attrDef.descriptionTranslations
        });

        const attributeData = {
          name: nameLocalization._id,
          code: attrDef.code,
          description: descriptionLocalization._id,
          type: attrDef.type,
          ...(attrDef.options && { options: attrDef.options }),
          ...(attrDef.validations && { validations: attrDef.validations }),
          isRequired: attrDef.isRequired,
          isActive: attrDef.isActive
        };

        const createdAttribute = await Attribute.create(attributeData);
        createdAttributes.push({
          ...createdAttribute.toObject(),
          code: attrDef.code
        });

        console.log(`✅ Attribute oluşturuldu: ${attrDef.code}`);
      } catch (error) {
        console.error(`❌ Attribute oluşturulamadı: ${attrDef.code}`, error);
      }
    }

    // ===========================================
    // 2. ATTRIBUTE GROUPS
    // ===========================================
    console.log('📋 Attribute Groups oluşturuluyor...');
    
    const attributeGroupDefinitions = [
      {
        nameTranslations: { tr: 'Kişi Bilgileri', en: 'Personal Information' },
        code: 'personal_info',
        descriptionTranslations: { tr: 'Kişisel bilgiler grubu', en: 'Personal information group' },
        attributeCodes: ['first_name', 'last_name', 'phone', 'email', 'birthday', 'address']
      },
      {
        nameTranslations: { tr: 'Sosyal Medya Bilgileri', en: 'Social Media Information' },
        code: 'social_media_info',
        descriptionTranslations: { tr: 'Sosyal medya hesap bilgileri', en: 'Social media account information' },
        attributeCodes: ['instagram', 'facebook']
      },
      {
        nameTranslations: { tr: 'Dükkan Bilgileri', en: 'Store Information' },
        code: 'store_info',
        descriptionTranslations: { tr: 'Mağaza bilgileri grubu', en: 'Store information group' },
        attributeCodes: ['store_name', 'location', 'store_address']
      },
      {
        nameTranslations: { tr: 'Sipariş Sahibi Bilgileri', en: 'Order Owner Information' },
        code: 'order_owner_info',
        descriptionTranslations: { tr: 'Sipariş sahibi bilgileri grubu', en: 'Order owner information group' },
        attributeCodes: ['order_owner_name', 'order_owner_surname', 'province', 'district', 'order_phone', 'order_address', 'note']
      },
      {
        nameTranslations: { tr: 'Stok', en: 'Stock' },
        code: 'stock_info',
        descriptionTranslations: { tr: 'Stok bilgileri grubu', en: 'Stock information group' },
        attributeCodes: ['stock_no']
      },
      {
        nameTranslations: { tr: 'Kumaş Özellikleri', en: 'Fabric Properties' },
        code: 'fabric_properties',
        descriptionTranslations: { tr: 'Kumaş özellikleri grubu', en: 'Fabric properties group' },
        attributeCodes: ['fabric_width', 'fabric_length', 'fold_count', 'square_meter']
      },
      {
        nameTranslations: { tr: 'Kasa Özellikleri', en: 'Case Properties' },
        code: 'case_properties',
        descriptionTranslations: { tr: 'Kasa özellikleri grubu', en: 'Case properties group' },
        attributeCodes: ['case_connection', 'case_length']
      },
      {
        nameTranslations: { tr: 'Şerit Özellikleri', en: 'Strip Properties' },
        code: 'strip_properties',
        descriptionTranslations: { tr: 'Şerit özellikleri grubu', en: 'Strip properties group' },
        attributeCodes: ['strip_color', 'strip_thickness']
      },
      {
        nameTranslations: { tr: 'İp Özellikleri', en: 'Thread Properties' },
        code: 'thread_properties',
        descriptionTranslations: { tr: 'İp özellikleri grubu', en: 'Thread properties group' },
        attributeCodes: ['thread_color', 'thread_length']
      },
      {
        nameTranslations: { tr: 'Kapak Özellikleri', en: 'Cover Properties' },
        code: 'cover_properties',
        descriptionTranslations: { tr: 'Kapak özellikleri grubu', en: 'Cover properties group' },
        attributeCodes: ['cover_color']
      },
      {
        nameTranslations: { tr: 'Kilit Özellikleri', en: 'Lock Properties' },
        code: 'lock_properties',
        descriptionTranslations: { tr: 'Kilit özellikleri grubu', en: 'Lock properties group' },
        attributeCodes: ['lock_color']
      },
      {
        nameTranslations: { tr: 'Sipariş', en: 'Order' },
        code: 'order_info',
        descriptionTranslations: { tr: 'Sipariş bilgileri grubu', en: 'Order information group' },
        attributeCodes: ['order_date', 'order_number', 'order_status']
      },
      {
        nameTranslations: { tr: 'Tekli Sistem Sipariş', en: 'Single System Order' },
        code: 'single_system_order',
        descriptionTranslations: { tr: 'Tekli sistem sipariş özellikleri', en: 'Single system order properties' },
        attributeCodes: ['measurements']
      }
    ];

    const createdAttributeGroups: any[] = [];
    for (const groupDef of attributeGroupDefinitions) {
      try {
        // Name için localization oluştur
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${groupDef.code}_name`,
          namespace: 'attribute_groups',
          translations: groupDef.nameTranslations
        });

        // Description için localization oluştur
        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${groupDef.code}_description`,
          namespace: 'attribute_groups',
          translations: groupDef.descriptionTranslations
        });

        // Attribute ID'lerini bul
        const attributeIds = createdAttributes
          .filter(attr => groupDef.attributeCodes.includes(attr.code))
          .map(attr => attr._id);

        const groupData = {
          name: nameLocalization._id,
          code: groupDef.code,
          description: descriptionLocalization._id,
          attributes: attributeIds,
          isActive: true
        };

        const createdGroup = await AttributeGroup.create(groupData);
        createdAttributeGroups.push({
          ...createdGroup.toObject(),
          code: groupDef.code
        });

        console.log(`✅ Attribute Group oluşturuldu: ${groupDef.code}`);
      } catch (error) {
        console.error(`❌ Attribute Group oluşturulamadı: ${groupDef.code}`, error);
      }
    }

    // ===========================================
    // 3. CATEGORIES (Kategoriler)
    // ===========================================
    console.log('📂 Categories oluşturuluyor...');
    
    const categoryDefinitions = [
      // Ana kategoriler
      {
        nameTranslations: { tr: 'Stok Çeşitleri', en: 'Stock Types' },
        code: 'stock_types',
        descriptionTranslations: { tr: 'Stok ürün çeşitleri', en: 'Stock product types' },
        parent: null
      },
      {
        nameTranslations: { tr: 'Müşteriler', en: 'Customers' },
        code: 'customers',
        descriptionTranslations: { tr: 'Müşteri kategorileri', en: 'Customer categories' },
        parent: null
      },
      {
        nameTranslations: { tr: 'Plise Sistemleri', en: 'Plise Systems' },
        code: 'plise_systems',
        descriptionTranslations: { tr: 'Plise perde sistemleri', en: 'Plise curtain systems' },
        parent: null
      },

      // Stok alt kategorileri
      {
        nameTranslations: { tr: 'Kumaş', en: 'Fabric' },
        code: 'fabric',
        descriptionTranslations: { tr: 'Kumaş stok ürünleri', en: 'Fabric stock products' },
        parent: 'stock_types'
      },
      {
        nameTranslations: { tr: 'Kasa', en: 'Case' },
        code: 'case',
        descriptionTranslations: { tr: 'Kasa stok ürünleri', en: 'Case stock products' },
        parent: 'stock_types'
      },
      {
        nameTranslations: { tr: 'Şerit', en: 'Strip' },
        code: 'strip',
        descriptionTranslations: { tr: 'Şerit stok ürünleri', en: 'Strip stock products' },
        parent: 'stock_types'
      },
      {
        nameTranslations: { tr: 'İp', en: 'Thread' },
        code: 'thread',
        descriptionTranslations: { tr: 'İp stok ürünleri', en: 'Thread stock products' },
        parent: 'stock_types'
      },
      {
        nameTranslations: { tr: 'Kapak', en: 'Cover' },
        code: 'cover',
        descriptionTranslations: { tr: 'Kapak stok ürünleri', en: 'Cover stock products' },
        parent: 'stock_types'
      },
      {
        nameTranslations: { tr: 'Kilit', en: 'Lock' },
        code: 'lock',
        descriptionTranslations: { tr: 'Kilit stok ürünleri', en: 'Lock stock products' },
        parent: 'stock_types'
      },
      {
        nameTranslations: { tr: 'Kuşgözü', en: 'Eyelet' },
        code: 'eyelet',
        descriptionTranslations: { tr: 'Kuşgözü stok ürünleri', en: 'Eyelet stock products' },
        parent: 'stock_types'
      },

      // Müşteri alt kategorileri
      {
        nameTranslations: { tr: 'Bireysel', en: 'Individual' },
        code: 'individual',
        descriptionTranslations: { tr: 'Bireysel müşteriler', en: 'Individual customers' },
        parent: 'customers'
      },
      {
        nameTranslations: { tr: 'Kurumsal', en: 'Corporate' },
        code: 'corporate',
        descriptionTranslations: { tr: 'Kurumsal müşteriler', en: 'Corporate customers' },
        parent: 'customers'
      },

      // Sipariş alt kategorileri
      {
        nameTranslations: { tr: 'Tekli Sistem', en: 'Single System' },
        code: 'single_system',
        descriptionTranslations: { tr: 'Tek kumaş ile çalışan plise sistemi', en: 'Plise system with single fabric' },
        parent: 'plise_systems'
      },
      {
        nameTranslations: { tr: 'Çiftli Sistem', en: 'Double System' },
        code: 'double_system',
        descriptionTranslations: { tr: 'İki kumaş ile çalışan plise sistemi', en: 'Plise system with double fabric' },
        parent: 'plise_systems'
      }
    ];

    const createdCategories: any[] = [];
    
    // Önce ana kategorileri oluştur
    for (const catDef of categoryDefinitions.filter(c => !c.parent)) {
      try {
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${catDef.code}_name`,
          namespace: 'categories',
          translations: catDef.nameTranslations
        });

        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${catDef.code}_description`,
          namespace: 'categories',
          translations: catDef.descriptionTranslations
        });

        const categoryData = {
          name: nameLocalization._id,
          code: catDef.code,
          description: descriptionLocalization._id,
          isActive: true
        };

        const createdCategory = await Category.create(categoryData);
        createdCategories.push({
          ...createdCategory.toObject(),
          code: catDef.code
        });

        console.log(`✅ Ana Kategori oluşturuldu: ${catDef.code}`);
      } catch (error) {
        console.error(`❌ Ana Kategori oluşturulamadı: ${catDef.code}`, error);
      }
    }

    // Sonra alt kategorileri oluştur
    for (const catDef of categoryDefinitions.filter(c => c.parent)) {
      try {
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${catDef.code}_name`,
          namespace: 'categories',
          translations: catDef.nameTranslations
        });

        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${catDef.code}_description`,
          namespace: 'categories',
          translations: catDef.descriptionTranslations
        });

        // Parent kategoriyi bul
        const parentCategory = createdCategories.find(c => c.code === catDef.parent);
        if (!parentCategory) {
          console.error(`❌ Parent kategori bulunamadı: ${catDef.parent}`);
          continue;
        }

        const categoryData = {
          name: nameLocalization._id,
          code: catDef.code,
          description: descriptionLocalization._id,
          parent: parentCategory._id,
          isActive: true
        };

        const createdCategory = await Category.create(categoryData);
        createdCategories.push({
          ...createdCategory.toObject(),
          code: catDef.code
        });

        console.log(`✅ Alt Kategori oluşturuldu: ${catDef.code} (Parent: ${catDef.parent})`);
      } catch (error) {
        console.error(`❌ Alt Kategori oluşturulamadı: ${catDef.code}`, error);
      }
    }

    // ===========================================
    // 4. FAMILIES (Aileler)
    // ===========================================
    console.log('👨‍👩‍👧‍👦 Families oluşturuluyor...');
    
    const familyDefinitions = [
      // KUMAŞ AİLELERİ - Kumaş kategorisine bağlı
      // Ana Kumaş Ailesi
      {
        nameTranslations: { tr: 'Kumaşlar', en: 'Fabrics' },
        code: 'fabrics',
        descriptionTranslations: { tr: 'Kumaş ürünleri ana ailesi', en: 'Main fabrics family' },
        parent: null,
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties']
      },

      // Rose Serisi - Kumaşlar ailesinin alt ailesi
      {
        nameTranslations: { tr: 'Rose Serisi', en: 'Rose Series' },
        code: 'rose_series',
        descriptionTranslations: { tr: 'Rose kumaş serisi', en: 'Rose fabric series' },
        parent: 'fabrics',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties']
      },

      // Rose Alt Aileleri (10 renk)
      {
        nameTranslations: { tr: 'Rose 1', en: 'Rose 1' },
        code: 'rose_1',
        descriptionTranslations: { tr: 'Rose serisi 1 numaralı renk', en: 'Rose series color 1' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 2', en: 'Rose 2' },
        code: 'rose_2',
        descriptionTranslations: { tr: 'Rose serisi 2 numaralı renk', en: 'Rose series color 2' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 3', en: 'Rose 3' },
        code: 'rose_3',
        descriptionTranslations: { tr: 'Rose serisi 3 numaralı renk', en: 'Rose series color 3' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 4', en: 'Rose 4' },
        code: 'rose_4',
        descriptionTranslations: { tr: 'Rose serisi 4 numaralı renk', en: 'Rose series color 4' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 5', en: 'Rose 5' },
        code: 'rose_5',
        descriptionTranslations: { tr: 'Rose serisi 5 numaralı renk', en: 'Rose series color 5' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 6', en: 'Rose 6' },
        code: 'rose_6',
        descriptionTranslations: { tr: 'Rose serisi 6 numaralı renk', en: 'Rose series color 6' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 7', en: 'Rose 7' },
        code: 'rose_7',
        descriptionTranslations: { tr: 'Rose serisi 7 numaralı renk', en: 'Rose series color 7' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 8', en: 'Rose 8' },
        code: 'rose_8',
        descriptionTranslations: { tr: 'Rose serisi 8 numaralı renk', en: 'Rose series color 8' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 9', en: 'Rose 9' },
        code: 'rose_9',
        descriptionTranslations: { tr: 'Rose serisi 9 numaralı renk', en: 'Rose series color 9' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Rose 10', en: 'Rose 10' },
        code: 'rose_10',
        descriptionTranslations: { tr: 'Rose serisi 10 numaralı renk', en: 'Rose series color 10' },
        parent: 'rose_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },

      // Liva Serisi (3 tane)
      {
        nameTranslations: { tr: 'Liva Serisi', en: 'Liva Series' },
        code: 'liva_series',
        descriptionTranslations: { tr: 'Liva kumaş serisi', en: 'Liva fabric series' },
        parent: 'fabrics',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties']
      },
      {
        nameTranslations: { tr: 'Liva 1', en: 'Liva 1' },
        code: 'liva_1',
        descriptionTranslations: { tr: 'Liva serisi 1 numaralı renk', en: 'Liva series color 1' },
        parent: 'liva_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Liva 2', en: 'Liva 2' },
        code: 'liva_2',
        descriptionTranslations: { tr: 'Liva serisi 2 numaralı renk', en: 'Liva series color 2' },
        parent: 'liva_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Liva 3', en: 'Liva 3' },
        code: 'liva_3',
        descriptionTranslations: { tr: 'Liva serisi 3 numaralı renk', en: 'Liva series color 3' },
        parent: 'liva_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },

      // Silver Serisi (3 tane)
      {
        nameTranslations: { tr: 'Silver Serisi', en: 'Silver Series' },
        code: 'silver_series',
        descriptionTranslations: { tr: 'Silver kumaş serisi', en: 'Silver fabric series' },
        parent: 'fabrics',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties']
      },
      {
        nameTranslations: { tr: 'Silver 1', en: 'Silver 1' },
        code: 'silver_1',
        descriptionTranslations: { tr: 'Silver serisi 1 numaralı renk', en: 'Silver series color 1' },
        parent: 'silver_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Silver 2', en: 'Silver 2' },
        code: 'silver_2',
        descriptionTranslations: { tr: 'Silver serisi 2 numaralı renk', en: 'Silver series color 2' },
        parent: 'silver_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Silver 3', en: 'Silver 3' },
        code: 'silver_3',
        descriptionTranslations: { tr: 'Silver serisi 3 numaralı renk', en: 'Silver series color 3' },
        parent: 'silver_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },

      // Jakar Serisi (3 tane)
      {
        nameTranslations: { tr: 'Jakar Serisi', en: 'Jacquard Series' },
        code: 'jakar_series',
        descriptionTranslations: { tr: 'Jakar kumaş serisi', en: 'Jacquard fabric series' },
        parent: 'fabrics',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties']
      },
      {
        nameTranslations: { tr: 'Jakar 1', en: 'Jakar 1' },
        code: 'jakar_1',
        descriptionTranslations: { tr: 'Jakar serisi 1 numaralı renk', en: 'Jacquard series color 1' },
        parent: 'jakar_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Jakar 2', en: 'Jakar 2' },
        code: 'jakar_2',
        descriptionTranslations: { tr: 'Jakar serisi 2 numaralı renk', en: 'Jacquard series color 2' },
        parent: 'jakar_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Jakar 3', en: 'Jakar 3' },
        code: 'jakar_3',
        descriptionTranslations: { tr: 'Jakar serisi 3 numaralı renk', en: 'Jacquard series color 3' },
        parent: 'jakar_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },

      // Blackout Serisi (1 tane)
      {
        nameTranslations: { tr: 'Blackout Serisi', en: 'Blackout Series' },
        code: 'blackout_series',
        descriptionTranslations: { tr: 'Blackout kumaş serisi', en: 'Blackout fabric series' },
        parent: 'fabrics',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },

      // Bat Serisi (3 tane)
      {
        nameTranslations: { tr: 'Bat Serisi', en: 'Bat Series' },
        code: 'bat_series',
        descriptionTranslations: { tr: 'Bat kumaş serisi', en: 'Bat fabric series' },
        parent: 'fabrics',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties']
      },
      {
        nameTranslations: { tr: 'Bat 1', en: 'Bat 1' },
        code: 'bat_1',
        descriptionTranslations: { tr: 'Bat serisi 1 numaralı renk', en: 'Bat series color 1' },
        parent: 'bat_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Bat 2', en: 'Bat 2' },
        code: 'bat_2',
        descriptionTranslations: { tr: 'Bat serisi 2 numaralı renk', en: 'Bat series color 2' },
        parent: 'bat_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Bat 3', en: 'Bat 3' },
        code: 'bat_3',
        descriptionTranslations: { tr: 'Bat serisi 3 numaralı renk', en: 'Bat series color 3' },
        parent: 'bat_series',
        categoryCode: 'fabric',
        attributeGroupCodes: ['fabric_properties', 'stock_info']
      },

      // KASA AİLELERİ - Kasa kategorisine bağlı
      {
        nameTranslations: { tr: 'Kasalar', en: 'Cases' },
        code: 'cases',
        descriptionTranslations: { tr: 'Kasa ürünleri ana ailesi', en: 'Main cases family' },
        parent: null,
        categoryCode: 'case',
        attributeGroupCodes: ['case_properties']
      },
      {
        nameTranslations: { tr: 'Beyaz', en: 'White' },
        code: 'white_case',
        descriptionTranslations: { tr: 'Beyaz renk kasa', en: 'White color case' },
        parent: 'cases',
        categoryCode: 'case',
        attributeGroupCodes: ['case_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Antrasit', en: 'Anthracite' },
        code: 'anthracite_case',
        descriptionTranslations: { tr: 'Antrasit renk kasa', en: 'Anthracite color case' },
        parent: 'cases',
        categoryCode: 'case',
        attributeGroupCodes: ['case_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Siyah', en: 'Black' },
        code: 'black_case',
        descriptionTranslations: { tr: 'Siyah renk kasa', en: 'Black color case' },
        parent: 'cases',
        categoryCode: 'case',
        attributeGroupCodes: ['case_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Bronz', en: 'Bronze' },
        code: 'bronze_case',
        descriptionTranslations: { tr: 'Bronz renk kasa', en: 'Bronze color case' },
        parent: 'cases',
        categoryCode: 'case',
        attributeGroupCodes: ['case_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Krem', en: 'Cream' },
        code: 'cream_case',
        descriptionTranslations: { tr: 'Krem renk kasa', en: 'Cream color case' },
        parent: 'cases',
        categoryCode: 'case',
        attributeGroupCodes: ['case_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Gri', en: 'Grey' },
        code: 'grey_case',
        descriptionTranslations: { tr: 'Gri renk kasa', en: 'Grey color case' },
        parent: 'cases',
        categoryCode: 'case',
        attributeGroupCodes: ['case_properties', 'stock_info']
      },

      // KAPAK AİLELERİ - Kapak kategorisine bağlı
      {
        nameTranslations: { tr: 'Kapaklar', en: 'Covers' },
        code: 'covers',
        descriptionTranslations: { tr: 'Kapak ürünleri ana ailesi', en: 'Main covers family' },
        parent: null,
        categoryCode: 'cover',
        attributeGroupCodes: ['cover_properties']
      },
      {
        nameTranslations: { tr: 'Beyaz', en: 'White' },
        code: 'white_cover',
        descriptionTranslations: { tr: 'Beyaz renk kapak', en: 'White color cover' },
        parent: 'covers',
        categoryCode: 'cover',
        attributeGroupCodes: ['cover_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Antrasit', en: 'Anthracite' },
        code: 'anthracite_cover',
        descriptionTranslations: { tr: 'Antrasit renk kapak', en: 'Anthracite color cover' },
        parent: 'covers',
        categoryCode: 'cover',
        attributeGroupCodes: ['cover_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Siyah', en: 'Black' },
        code: 'black_cover',
        descriptionTranslations: { tr: 'Siyah renk kapak', en: 'Black color cover' },
        parent: 'covers',
        categoryCode: 'cover',
        attributeGroupCodes: ['cover_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Bronz', en: 'Bronze' },
        code: 'bronze_cover',
        descriptionTranslations: { tr: 'Bronz renk kapak', en: 'Bronze color cover' },
        parent: 'covers',
        categoryCode: 'cover',
        attributeGroupCodes: ['cover_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Krem', en: 'Cream' },
        code: 'cream_cover',
        descriptionTranslations: { tr: 'Krem renk kapak', en: 'Cream color cover' },
        parent: 'covers',
        categoryCode: 'cover',
        attributeGroupCodes: ['cover_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Gri', en: 'Grey' },
        code: 'grey_cover',
        descriptionTranslations: { tr: 'Gri renk kapak', en: 'Grey color cover' },
        parent: 'covers',
        categoryCode: 'cover',
        attributeGroupCodes: ['cover_properties', 'stock_info']
      },

      // KİLİT AİLELERİ - Kilit kategorisine bağlı
      {
        nameTranslations: { tr: 'Kilitler', en: 'Locks' },
        code: 'locks',
        descriptionTranslations: { tr: 'Kilit ürünleri ana ailesi', en: 'Main locks family' },
        parent: null,
        categoryCode: 'lock',
        attributeGroupCodes: ['lock_properties']
      },
      {
        nameTranslations: { tr: 'Beyaz', en: 'White' },
        code: 'white_lock',
        descriptionTranslations: { tr: 'Beyaz renk kilit', en: 'White color lock' },
        parent: 'locks',
        categoryCode: 'lock',
        attributeGroupCodes: ['lock_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Antrasit', en: 'Anthracite' },
        code: 'anthracite_lock',
        descriptionTranslations: { tr: 'Antrasit renk kilit', en: 'Anthracite color lock' },
        parent: 'locks',
        categoryCode: 'lock',
        attributeGroupCodes: ['lock_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Siyah', en: 'Black' },
        code: 'black_lock',
        descriptionTranslations: { tr: 'Siyah renk kilit', en: 'Black color lock' },
        parent: 'locks',
        categoryCode: 'lock',
        attributeGroupCodes: ['lock_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Bronz', en: 'Bronze' },
        code: 'bronze_lock',
        descriptionTranslations: { tr: 'Bronz renk kilit', en: 'Bronze color lock' },
        parent: 'locks',
        categoryCode: 'lock',
        attributeGroupCodes: ['lock_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Krem', en: 'Cream' },
        code: 'cream_lock',
        descriptionTranslations: { tr: 'Krem renk kilit', en: 'Cream color lock' },
        parent: 'locks',
        categoryCode: 'lock',
        attributeGroupCodes: ['lock_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Gri', en: 'Grey' },
        code: 'grey_lock',
        descriptionTranslations: { tr: 'Gri renk kilit', en: 'Grey color lock' },
        parent: 'locks',
        categoryCode: 'lock',
        attributeGroupCodes: ['lock_properties', 'stock_info']
      },

      // İP AİLELERİ - İp kategorisine bağlı
      {
        nameTranslations: { tr: 'İpler', en: 'Threads' },
        code: 'threads',
        descriptionTranslations: { tr: 'İp ürünleri ana ailesi', en: 'Main threads family' },
        parent: null,
        categoryCode: 'thread',
        attributeGroupCodes: ['thread_properties']
      },
      {
        nameTranslations: { tr: 'Beyaz', en: 'White' },
        code: 'white_thread',
        descriptionTranslations: { tr: 'Beyaz renk ip', en: 'White color thread' },
        parent: 'threads',
        categoryCode: 'thread',
        attributeGroupCodes: ['thread_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Siyah', en: 'Black' },
        code: 'black_thread',
        descriptionTranslations: { tr: 'Siyah renk ip', en: 'Black color thread' },
        parent: 'threads',
        categoryCode: 'thread',
        attributeGroupCodes: ['thread_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Gri', en: 'Grey' },
        code: 'grey_thread',
        descriptionTranslations: { tr: 'Gri renk ip', en: 'Grey color thread' },
        parent: 'threads',
        categoryCode: 'thread',
        attributeGroupCodes: ['thread_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Kahverengi', en: 'Brown' },
        code: 'brown_thread',
        descriptionTranslations: { tr: 'Kahverengi renk ip', en: 'Brown color thread' },
        parent: 'threads',
        categoryCode: 'thread',
        attributeGroupCodes: ['thread_properties', 'stock_info']
      },
      {
        nameTranslations: { tr: 'Sarı', en: 'Yellow' },
        code: 'yellow_thread',
        descriptionTranslations: { tr: 'Sarı renk ip', en: 'Yellow color thread' },
        parent: 'threads',
        categoryCode: 'thread',
        attributeGroupCodes: ['thread_properties', 'stock_info']
      },

      // MÜŞTERİ AİLELERİ
      // Bireysel kategorisine bağlı ana aile
      {
        nameTranslations: { tr: 'Bireysel Müşteriler', en: 'Individual Customers' },
        code: 'individual_customers',
        descriptionTranslations: { tr: 'Bireysel müşteri ailesi', en: 'Individual customers family' },
        parent: null,
        categoryCode: 'individual',
        attributeGroupCodes: ['personal_info']
      },
      // Bireysel müşteriler ailesinin alt aileleri
      {
        nameTranslations: { tr: 'Bireysel Sosyal Medya', en: 'Individual Social Media' },
        code: 'individual_social_media',
        descriptionTranslations: { tr: 'Sosyal medyadan gelen bireysel müşteriler', en: 'Individual customers from social media' },
        parent: 'individual_customers',
        categoryCode: 'individual',
        attributeGroupCodes: ['personal_info', 'social_media_info']
      },
      {
        nameTranslations: { tr: 'Bireysel İş Ortağı', en: 'Individual Business Partner' },
        code: 'individual_business_partner',
        descriptionTranslations: { tr: 'İş ortağı olan bireysel müşteriler', en: 'Individual customers who are business partners' },
        parent: 'individual_customers',
        categoryCode: 'individual',
        attributeGroupCodes: ['order_owner_info']
      },

      // Kurumsal kategorisine bağlı ana aile
      {
        nameTranslations: { tr: 'Kurumsal Müşteriler', en: 'Corporate Customers' },
        code: 'corporate_customers',
        descriptionTranslations: { tr: 'Kurumsal müşteri ailesi', en: 'Corporate customers family' },
        parent: null,
        categoryCode: 'corporate',
        attributeGroupCodes: ['store_info']
      },
      // Kurumsal müşteriler ailesinin alt aileleri
      {
        nameTranslations: { tr: 'İş Ortakları', en: 'Business Partners' },
        code: 'business_partners',
        descriptionTranslations: { tr: 'Kurumsal iş ortakları', en: 'Corporate business partners' },
        parent: 'corporate_customers',
        categoryCode: 'corporate',
        attributeGroupCodes: ['store_info', 'personal_info']
      },
      {
        nameTranslations: { tr: 'Çözüm Ortakları', en: 'Solution Partners' },
        code: 'solution_partners',
        descriptionTranslations: { tr: 'Kurumsal çözüm ortakları', en: 'Corporate solution partners' },
        parent: 'corporate_customers',
        categoryCode: 'corporate',
        attributeGroupCodes: ['store_info', 'personal_info']
      },

      // SİPARİŞ AİLELERİ
      // Tekli Sistem
      {
        nameTranslations: { tr: 'Tekli Sistem', en: 'Single System' },
        code: 'single_system_family',
        descriptionTranslations: { tr: 'Tekli sistem sipariş ailesi', en: 'Single system order family' },
        parent: null,
        categoryCode: 'single_system',
        attributeGroupCodes: ['order_info', 'single_system_order']
      },

      // Çiftli Sistem
      {
        nameTranslations: { tr: 'Çiftli Sistem', en: 'Double System' },
        code: 'double_system_family',
        descriptionTranslations: { tr: 'Çiftli sistem sipariş ailesi', en: 'Double system order family' },
        parent: null,
        categoryCode: 'double_system',
        attributeGroupCodes: ['order_info']
      }
    ];

    const createdFamilies: any[] = [];
    
    // Önce ana aileleri oluştur
    for (const famDef of familyDefinitions.filter(f => !f.parent)) {
      try {
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${famDef.code}_name`,
          namespace: 'families',
          translations: famDef.nameTranslations
        });

        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${famDef.code}_description`,
          namespace: 'families',
          translations: famDef.descriptionTranslations
        });

        // Attribute Group ID'lerini bul
        const attributeGroupIds = createdAttributeGroups
          .filter(group => famDef.attributeGroupCodes.includes(group.code))
          .map(group => group._id);

        // Category ID'sini bul (varsa)
        let categoryId = null;
        if (famDef.categoryCode) {
          const category = createdCategories.find(c => c.code === famDef.categoryCode);
          if (category) {
            categoryId = category._id;
          }
        }

        const familyData = {
          name: nameLocalization._id,
          code: famDef.code,
          description: descriptionLocalization._id,
          ...(categoryId && { category: categoryId }),
          attributeGroups: attributeGroupIds,
          isActive: true
        };

        const createdFamily = await Family.create(familyData);
        createdFamilies.push({
          ...createdFamily.toObject(),
          code: famDef.code
        });

        console.log(`✅ Ana Aile oluşturuldu: ${famDef.code}`);
      } catch (error) {
        console.error(`❌ Ana Aile oluşturulamadı: ${famDef.code}`, error);
      }
    }

    // Sonra alt aileleri oluştur
    for (const famDef of familyDefinitions.filter(f => f.parent)) {
      try {
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${famDef.code}_name`,
          namespace: 'families',
          translations: famDef.nameTranslations
        });

        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${famDef.code}_description`,
          namespace: 'families',
          translations: famDef.descriptionTranslations
        });

        // Parent aileyi bul
        const parentFamily = createdFamilies.find(f => f.code === famDef.parent);
        if (!parentFamily) {
          console.error(`❌ Parent aile bulunamadı: ${famDef.parent}`);
          continue;
        }

        // Attribute Group ID'lerini bul
        const attributeGroupIds = createdAttributeGroups
          .filter(group => famDef.attributeGroupCodes.includes(group.code))
          .map(group => group._id);

        // Category ID'sini bul (varsa)
        let categoryId = null;
        if (famDef.categoryCode) {
          const category = createdCategories.find(c => c.code === famDef.categoryCode);
          if (category) {
            categoryId = category._id;
          }
        }

        const familyData = {
          name: nameLocalization._id,
          code: famDef.code,
          description: descriptionLocalization._id,
          parent: parentFamily._id,
          ...(categoryId && { category: categoryId }),
          attributeGroups: attributeGroupIds,
          isActive: true
        };

        const createdFamily = await Family.create(familyData);
        createdFamilies.push({
          ...createdFamily.toObject(),
          code: famDef.code
        });

        console.log(`✅ Alt Aile oluşturuldu: ${famDef.code} (Parent: ${famDef.parent})`);
      } catch (error) {
        console.error(`❌ Alt Aile oluşturulamadı: ${famDef.code}`, error);
      }
    }

    // ===========================================
    // 5. ITEM TYPES
    // ===========================================
    console.log('🏷️ ItemTypes oluşturuluyor...');
    
    const itemTypeDefinitions = [
      {
        nameTranslations: { tr: 'Stok', en: 'Stock' },
        code: 'stock',
        descriptionTranslations: { tr: 'Stok ürünleri ve miktar bilgileri', en: 'Stock products and quantity information' },
        categoryCode: 'stock_types',
        attributeGroupCodes: ['stock_info']
      },
      {
        nameTranslations: { tr: 'Müşteri', en: 'Customer' },
        code: 'customer',
        descriptionTranslations: { tr: 'Müşteri bilgileri ve iletişim detayları', en: 'Customer information and contact details' },
        categoryCode: 'customers',
        attributeGroupCodes: ['personal_info']
      },
      {
        nameTranslations: { tr: 'Sipariş', en: 'Order' },
        code: 'order',
        descriptionTranslations: { tr: 'Sipariş bilgileri ve durum takibi', en: 'Order information and status tracking' },
        categoryCode: 'plise_systems',
        attributeGroupCodes: ['order_info']
      }
    ];

    const createdItemTypes: any[] = [];
    for (const itemTypeDef of itemTypeDefinitions) {
      try {
        const nameLocalization = await localizationService.upsertTranslation({
          key: `${itemTypeDef.code}_name`,
          namespace: 'item_types',
          translations: itemTypeDef.nameTranslations
        });

        const descriptionLocalization = await localizationService.upsertTranslation({
          key: `${itemTypeDef.code}_description`,
          namespace: 'item_types',
          translations: itemTypeDef.descriptionTranslations
        });

        // Category ID'sini bul (varsa)
        let categoryId = null;
        if (itemTypeDef.categoryCode) {
          const category = createdCategories.find(c => c.code === itemTypeDef.categoryCode);
          if (category) {
            categoryId = category._id;
          }
        }

        // Attribute Group ID'lerini bul
        const attributeGroupIds = createdAttributeGroups
          .filter(group => itemTypeDef.attributeGroupCodes.includes(group.code))
          .map(group => group._id);

        const itemTypeData = {
          name: nameLocalization._id,
          code: itemTypeDef.code,
          description: descriptionLocalization._id,
          ...(categoryId && { category: categoryId }),
          attributeGroups: attributeGroupIds,
          isActive: true
        };

        const createdItemType = await ItemType.create(itemTypeData);
        createdItemTypes.push({
          ...createdItemType.toObject(),
          code: itemTypeDef.code
        });

        console.log(`✅ ItemType oluşturuldu: ${itemTypeDef.code}`);
      } catch (error) {
        console.error(`❌ ItemType oluşturulamadı: ${itemTypeDef.code}`, error);
      }
    }

    console.log(`\n🎉 Plicess Perde Sistemi başarıyla kuruldu!`);
    console.log(`📊 Toplam oluşturulan:`);
    console.log(`   - Attributes: ${createdAttributes.length}`);
    console.log(`   - Attribute Groups: ${createdAttributeGroups.length}`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Families: ${createdFamilies.length}`);
    console.log(`   - ItemTypes: ${createdItemTypes.length}`);
    
    console.log(`\n📋 Detaylar:`);
    console.log(`   🎯 ItemTypes: Stok, Müşteri, Sipariş`);
    console.log(`   📂 Ana Kategoriler: Stok Çeşitleri (Kumaş, Kasa, Şerit, İp, Kapak, Kilit, Kuşgözü), Müşteriler (Bireysel, Kurumsal), Plise Sistemleri (Tekli/Çiftli)`);
    console.log(`   👨‍👩‍👧‍👦 Kumaş Aileleri: Rose (10 renk), Liva (3), Silver (3), Jakar (3), Blackout (1), Bat (3)`);
    console.log(`   🎨 Diğer Aileler: Kasa/Kapak/Kilit Renkleri (Beyaz, Antrasit, Siyah, Bronz, Krem, Gri), İp Renkleri (5 renk)`);
    console.log(`   👥 Müşteri Aileleri:`);
    console.log(`     • Bireysel → Bireysel Müşteriler → (Bireysel Sosyal Medya, Bireysel İş Ortağı)`);
    console.log(`     • Kurumsal → Kurumsal Müşteriler → (İş Ortakları, Çözüm Ortakları)`);
    console.log(`   📝 Attribute Groups: ${createdAttributeGroups.length} adet`);
    console.log(`   🏷️ Attributes: ${createdAttributes.length} adet`);
    
    console.log(`\n🚀 Sistem kullanıma hazır!`);
    console.log(`   • Stok girişi için "Stok" ItemType'ını kullanın`);
    console.log(`   • Müşteri kaydı için "Müşteri" ItemType'ını kullanın`);
    console.log(`   • Sipariş girişi için "Sipariş" ItemType'ını kullanın`);
    console.log(`   • Associations kullanarak Sipariş-Müşteri ve Sipariş-Stok ilişkilerini kurun`);
    
    console.log(`\n🏗️ Hiyerarşi yapısı:`);
    console.log(`   ItemType → Category → Family → Alt Family`);
    console.log(`   Stok → Kumaş → Kumaşlar → Rose Serisi → Rose 1-10`);
    console.log(`   Müşteri → Bireysel → Bireysel Müşteriler → Bireysel Sosyal Medya`);
    console.log(`   Sipariş → Tekli Sistem → Tekli Sistem Ailesi`);
    console.log(`\n🔗 İlişkiler Association ile kurulacak:`);
    console.log(`   • Sipariş ↔ Müşteri (hangisi sipariş verdi)`);
    console.log(`   • Sipariş ↔ Stok (hangi kumaş/kasa kullanıldı)`);

  } catch (error) {
    console.error('❌ Kurulum hatası:', error);
  } finally {
    // MongoDB bağlantısını kapat
    await mongoose.disconnect();
    console.log('📊 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  setupPlicessPerdeSistemi();
}

export default setupPlicessPerdeSistemi;
