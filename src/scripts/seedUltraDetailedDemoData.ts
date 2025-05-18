import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/database';
import User from '../models/User';
import ItemType from '../models/ItemType';
import Family from '../models/Family';
import Category from '../models/Category';
import Attribute, { AttributeType } from '../models/Attribute';
import AttributeGroup from '../models/AttributeGroup';
import Item from '../models/Item';
import RelationshipType from '../models/RelationshipType';
import Relationship from '../models/Relationship';

async function seed() {
  await connectDB();
  console.log('Veritabanı bağlantısı başarılı. Ultra detaylı demo veri ekleniyor...');

  try {
    // Mevcut verileri temizle
    console.log('Mevcut veriler temizleniyor...');
    
    // Önce ilişkileri temizle (foreign key bağımlılıkları nedeniyle)
    await (await import('../models/Relationship')).default.deleteMany({});
    await (await import('../models/RelationshipType')).default.deleteMany({});
    
    // Sonra diğer koleksiyonları temizle
    await (await import('../models/Item')).default.deleteMany({});
    await (await import('../models/Attribute')).default.deleteMany({});
    await (await import('../models/AttributeGroup')).default.deleteMany({});
    await (await import('../models/Category')).default.deleteMany({});
    await (await import('../models/Family')).default.deleteMany({});
    await (await import('../models/ItemType')).default.deleteMany({});
    
    // Rol ve izinleri temizle
    await (await import('../models/Role')).default.deleteMany({});
    await (await import('../models/Permission')).default.deleteMany({});
    await (await import('../models/PermissionGroup')).default.deleteMany({});
    
    // Kullanıcıları temizle
    await (await import('../models/User')).default.deleteMany({});
    
    console.log('Mevcut veriler temizlendi. Yeni veriler yükleniyor...');

    // 1. İzin grupları ve izinler
    // İzin grupları tanımları
    const permissionGroups = [
      { name: 'Öznitelik Yönetimi', code: 'ATTRIBUTES', description: 'Ürün özniteliklerinin yönetimi için izinler', isActive: true },
      { name: 'Öznitelik Grubu Yönetimi', code: 'ATTRIBUTE_GROUPS', description: 'Öznitelik gruplarının yönetimi için izinler', isActive: true },
      { name: 'Kategori Yönetimi', code: 'CATEGORIES', description: 'Ürün kategorilerinin yönetimi için izinler', isActive: true },
      { name: 'Aile Yönetimi', code: 'FAMILIES', description: 'Ürün ailelerinin yönetimi için izinler', isActive: true },
      { name: 'Geçmiş Yönetimi', code: 'HISTORY', description: 'Sistem geçmişinin görüntülenmesi için izinler', isActive: true },
      { name: 'Ürün Yönetimi', code: 'ITEMS', description: 'Ürünlerin yönetimi için izinler', isActive: true },
      { name: 'Ürün Tipi Yönetimi', code: 'ITEM_TYPES', description: 'Ürün tiplerinin yönetimi için izinler', isActive: true },
      { name: 'İzin Yönetimi', code: 'PERMISSIONS', description: 'Sistem izinlerinin yönetimi için izinler', isActive: true },
      { name: 'İzin Grubu Yönetimi', code: 'PERMISSION_GROUPS', description: 'İzin gruplarının yönetimi için izinler', isActive: true },
      { name: 'İlişki Yönetimi', code: 'RELATIONSHIPS', description: 'Ürün ilişkilerinin yönetimi için izinler', isActive: true },
      { name: 'İlişki Tipi Yönetimi', code: 'RELATIONSHIP_TYPES', description: 'İlişki tiplerinin yönetimi için izinler', isActive: true },
      { name: 'Çeviri Yönetimi', code: 'TRANSLATIONS', description: 'Sistem çevirilerinin yönetimi için izinler', isActive: true },
      { name: 'Kullanıcı Yönetimi', code: 'USERS', description: 'Kullanıcıların yönetimi için izinler', isActive: true },
      { name: 'Rol Yönetimi', code: 'ROLES', description: 'Kullanıcı rollerinin yönetimi için izinler', isActive: true },
      { name: 'Sistem Ayarları', code: 'SETTINGS', description: 'Sistem ayarlarının yönetimi için izinler', isActive: true }
    ];

    // İzin gruplarını veritabanına ekle
    const createdPermissionGroups = await Promise.all(
      permissionGroups.map(async group => (await import('../models/PermissionGroup')).default.create(group))
    );

    console.log(`${createdPermissionGroups.length} izin grubu eklendi`);

    // Grup ID'lerini kod bazında eşleştir
    const permissionGroupMap = new Map();
    createdPermissionGroups.forEach(group => {
      permissionGroupMap.set(group.code, group._id);
    });

    // İzin tanımları
    const permissionDefinitions = [
      // Öznitelik İzinleri
      { name: 'Öznitelikleri Görüntüleme', code: 'ATTRIBUTES_VIEW', groupCode: 'ATTRIBUTES', description: 'Öznitelikleri görüntüleme izni' },
      { name: 'Öznitelik Oluşturma', code: 'ATTRIBUTES_CREATE', groupCode: 'ATTRIBUTES', description: 'Yeni öznitelik oluşturma izni' },
      { name: 'Öznitelik Güncelleme', code: 'ATTRIBUTES_UPDATE', groupCode: 'ATTRIBUTES', description: 'Mevcut öznitelikleri güncelleme izni' },
      { name: 'Öznitelik Silme', code: 'ATTRIBUTES_DELETE', groupCode: 'ATTRIBUTES', description: 'Öznitelik silme izni' },

      // Öznitelik Grubu İzinleri
      { name: 'Öznitelik Gruplarını Görüntüleme', code: 'ATTRIBUTE_GROUPS_VIEW', groupCode: 'ATTRIBUTE_GROUPS', description: 'Öznitelik gruplarını görüntüleme izni' },
      { name: 'Öznitelik Grubu Oluşturma', code: 'ATTRIBUTE_GROUPS_CREATE', groupCode: 'ATTRIBUTE_GROUPS', description: 'Yeni öznitelik grubu oluşturma izni' },
      { name: 'Öznitelik Grubu Güncelleme', code: 'ATTRIBUTE_GROUPS_UPDATE', groupCode: 'ATTRIBUTE_GROUPS', description: 'Mevcut öznitelik gruplarını güncelleme izni' },
      { name: 'Öznitelik Grubu Silme', code: 'ATTRIBUTE_GROUPS_DELETE', groupCode: 'ATTRIBUTE_GROUPS', description: 'Öznitelik grubu silme izni' },

      // Kategori İzinleri
      { name: 'Kategorileri Görüntüleme', code: 'CATEGORIES_VIEW', groupCode: 'CATEGORIES', description: 'Kategorileri görüntüleme izni' },
      { name: 'Kategori Oluşturma', code: 'CATEGORIES_CREATE', groupCode: 'CATEGORIES', description: 'Yeni kategori oluşturma izni' },
      { name: 'Kategori Güncelleme', code: 'CATEGORIES_UPDATE', groupCode: 'CATEGORIES', description: 'Mevcut kategorileri güncelleme izni' },
      { name: 'Kategori Silme', code: 'CATEGORIES_DELETE', groupCode: 'CATEGORIES', description: 'Kategori silme izni' },

      // Aile İzinleri
      { name: 'Aileleri Görüntüleme', code: 'FAMILIES_VIEW', groupCode: 'FAMILIES', description: 'Aileleri görüntüleme izni' },
      { name: 'Aile Oluşturma', code: 'FAMILIES_CREATE', groupCode: 'FAMILIES', description: 'Yeni aile oluşturma izni' },
      { name: 'Aile Güncelleme', code: 'FAMILIES_UPDATE', groupCode: 'FAMILIES', description: 'Mevcut aileleri güncelleme izni' },
      { name: 'Aile Silme', code: 'FAMILIES_DELETE', groupCode: 'FAMILIES', description: 'Aile silme izni' },

      // Geçmiş İzinleri
      { name: 'Geçmişi Görüntüleme', code: 'HISTORY_VIEW', groupCode: 'HISTORY', description: 'Sistem geçmişini görüntüleme izni' },

      // Ürün İzinleri
      { name: 'Ürünleri Görüntüleme', code: 'ITEMS_VIEW', groupCode: 'ITEMS', description: 'Ürünleri görüntüleme izni' },
      { name: 'Ürün Oluşturma', code: 'ITEMS_CREATE', groupCode: 'ITEMS', description: 'Yeni ürün oluşturma izni' },
      { name: 'Ürün Güncelleme', code: 'ITEMS_UPDATE', groupCode: 'ITEMS', description: 'Mevcut ürünleri güncelleme izni' },
      { name: 'Ürün Silme', code: 'ITEMS_DELETE', groupCode: 'ITEMS', description: 'Ürün silme izni' },

      // Ürün Tipi İzinleri
      { name: 'Ürün Tiplerini Görüntüleme', code: 'ITEM_TYPES_VIEW', groupCode: 'ITEM_TYPES', description: 'Ürün tiplerini görüntüleme izni' },
      { name: 'Ürün Tipi Oluşturma', code: 'ITEM_TYPES_CREATE', groupCode: 'ITEM_TYPES', description: 'Yeni ürün tipi oluşturma izni' },
      { name: 'Ürün Tipi Güncelleme', code: 'ITEM_TYPES_UPDATE', groupCode: 'ITEM_TYPES', description: 'Mevcut ürün tiplerini güncelleme izni' },
      { name: 'Ürün Tipi Silme', code: 'ITEM_TYPES_DELETE', groupCode: 'ITEM_TYPES', description: 'Ürün tipi silme izni' },

      // İzin İzinleri
      { name: 'İzinleri Görüntüleme', code: 'PERMISSIONS_VIEW', groupCode: 'PERMISSIONS', description: 'İzinleri görüntüleme izni' },
      { name: 'İzin Oluşturma', code: 'PERMISSIONS_CREATE', groupCode: 'PERMISSIONS', description: 'Yeni izin oluşturma izni' },
      { name: 'İzin Güncelleme', code: 'PERMISSIONS_UPDATE', groupCode: 'PERMISSIONS', description: 'Mevcut izinleri güncelleme izni' },
      { name: 'İzin Silme', code: 'PERMISSIONS_DELETE', groupCode: 'PERMISSIONS', description: 'İzin silme izni' },

      // İzin Grubu İzinleri
      { name: 'İzin Gruplarını Görüntüleme', code: 'PERMISSION_GROUPS_VIEW', groupCode: 'PERMISSION_GROUPS', description: 'İzin gruplarını görüntüleme izni' },
      { name: 'İzin Grubu Oluşturma', code: 'PERMISSION_GROUPS_CREATE', groupCode: 'PERMISSION_GROUPS', description: 'Yeni izin grubu oluşturma izni' },
      { name: 'İzin Grubu Güncelleme', code: 'PERMISSION_GROUPS_UPDATE', groupCode: 'PERMISSION_GROUPS', description: 'Mevcut izin gruplarını güncelleme izni' },
      { name: 'İzin Grubu Silme', code: 'PERMISSION_GROUPS_DELETE', groupCode: 'PERMISSION_GROUPS', description: 'İzin grubu silme izni' },

      // İlişki İzinleri
      { name: 'İlişkileri Görüntüleme', code: 'RELATIONSHIPS_VIEW', groupCode: 'RELATIONSHIPS', description: 'İlişkileri görüntüleme izni' },
      { name: 'İlişki Oluşturma', code: 'RELATIONSHIPS_CREATE', groupCode: 'RELATIONSHIPS', description: 'Yeni ilişki oluşturma izni' },
      { name: 'İlişki Güncelleme', code: 'RELATIONSHIPS_UPDATE', groupCode: 'RELATIONSHIPS', description: 'Mevcut ilişkileri güncelleme izni' },
      { name: 'İlişki Silme', code: 'RELATIONSHIPS_DELETE', groupCode: 'RELATIONSHIPS', description: 'İlişki silme izni' },

      // İlişki Tipi İzinleri
      { name: 'İlişki Tiplerini Görüntüleme', code: 'RELATIONSHIP_TYPES_VIEW', groupCode: 'RELATIONSHIP_TYPES', description: 'İlişki tiplerini görüntüleme izni' },
      { name: 'İlişki Tipi Oluşturma', code: 'RELATIONSHIP_TYPES_CREATE', groupCode: 'RELATIONSHIP_TYPES', description: 'Yeni ilişki tipi oluşturma izni' },
      { name: 'İlişki Tipi Güncelleme', code: 'RELATIONSHIP_TYPES_UPDATE', groupCode: 'RELATIONSHIP_TYPES', description: 'Mevcut ilişki tiplerini güncelleme izni' },
      { name: 'İlişki Tipi Silme', code: 'RELATIONSHIP_TYPES_DELETE', groupCode: 'RELATIONSHIP_TYPES', description: 'İlişki tipi silme izni' },

      // Çeviri İzinleri
      { name: 'Çevirileri Görüntüleme', code: 'TRANSLATIONS_VIEW', groupCode: 'TRANSLATIONS', description: 'Çevirileri görüntüleme izni' },
      { name: 'Çevirileri Yönetme', code: 'TRANSLATIONS_MANAGE', groupCode: 'TRANSLATIONS', description: 'Çevirileri yönetme izni' },

      // Kullanıcı İzinleri
      { name: 'Kullanıcıları Görüntüleme', code: 'USERS_VIEW', groupCode: 'USERS', description: 'Kullanıcıları görüntüleme izni' },
      { name: 'Kullanıcı Oluşturma', code: 'USERS_CREATE', groupCode: 'USERS', description: 'Yeni kullanıcı oluşturma izni' },
      { name: 'Kullanıcı Güncelleme', code: 'USERS_UPDATE', groupCode: 'USERS', description: 'Mevcut kullanıcıları güncelleme izni' },
      { name: 'Kullanıcı Silme', code: 'USERS_DELETE', groupCode: 'USERS', description: 'Kullanıcı silme izni' },

      // Rol İzinleri
      { name: 'Rolleri Görüntüleme', code: 'ROLES_VIEW', groupCode: 'ROLES', description: 'Rolleri görüntüleme izni' },
      { name: 'Rol Oluşturma', code: 'ROLES_CREATE', groupCode: 'ROLES', description: 'Yeni rol oluşturma izni' },
      { name: 'Rol Güncelleme', code: 'ROLES_UPDATE', groupCode: 'ROLES', description: 'Mevcut rolleri güncelleme izni' },
      { name: 'Rol Silme', code: 'ROLES_DELETE', groupCode: 'ROLES', description: 'Rol silme izni' },

      // Sistem Ayarları İzinleri
      { name: 'Sistem Ayarlarını Görüntüleme', code: 'SETTINGS_VIEW', groupCode: 'SETTINGS', description: 'Sistem ayarlarını görüntüleme izni' },
      { name: 'Sistem Ayarlarını Yönetme', code: 'SETTINGS_MANAGE', groupCode: 'SETTINGS', description: 'Sistem ayarlarını güncelleme izni' }
    ];

    // İzinleri veritabanına ekle
    const createdPermissions = await Promise.all(
      permissionDefinitions.map(async perm => (await import('../models/Permission')).default.create({
        name: perm.name,
        code: perm.code,
        description: perm.description,
        permissionGroup: permissionGroupMap.get(perm.groupCode),
        isActive: true
      }))
    );

    console.log(`${createdPermissions.length} izin eklendi`);

    // İzin kodlarını ID ile eşleştirme
    const permissionCodeMap = new Map();
    createdPermissions.forEach(perm => {
      permissionCodeMap.set(perm.code, perm._id);
    });

    // Tüm izinler
    const allPermissionIds = createdPermissions.map(perm => perm._id);

    // Sadece görüntüleme (VIEW) izinleri
    const viewPermissionIds = createdPermissions
      .filter(perm => perm.code.endsWith('_VIEW'))
      .map(perm => perm._id);

    // Ürün yönetimi ile ilgili izinleri
    const productPermissionCodes = [
      'ITEMS_VIEW', 'ITEMS_CREATE', 'ITEMS_UPDATE', 'ITEMS_DELETE',
      'ITEM_TYPES_VIEW', 'ITEM_TYPES_CREATE', 'ITEM_TYPES_UPDATE', 'ITEM_TYPES_DELETE',
      'ATTRIBUTES_VIEW', 'ATTRIBUTES_CREATE', 'ATTRIBUTES_UPDATE', 'ATTRIBUTES_DELETE',
      'ATTRIBUTE_GROUPS_VIEW', 'ATTRIBUTE_GROUPS_CREATE', 'ATTRIBUTE_GROUPS_UPDATE', 'ATTRIBUTE_GROUPS_DELETE',
      'CATEGORIES_VIEW', 'CATEGORIES_CREATE', 'CATEGORIES_UPDATE', 'CATEGORIES_DELETE',
      'FAMILIES_VIEW', 'FAMILIES_CREATE', 'FAMILIES_UPDATE', 'FAMILIES_DELETE'
    ];
    const productPermissionIds = productPermissionCodes.map(code => permissionCodeMap.get(code));

    // 2. Roller
    // İçerik yönetimi ile ilgili izinler
    const contentPermissionCodes = [
      'TRANSLATIONS_VIEW', 'TRANSLATIONS_MANAGE',
      'RELATIONSHIPS_VIEW', 'RELATIONSHIPS_CREATE', 'RELATIONSHIPS_UPDATE', 'RELATIONSHIPS_DELETE',
      'RELATIONSHIP_TYPES_VIEW', 'RELATIONSHIP_TYPES_CREATE', 'RELATIONSHIP_TYPES_UPDATE', 'RELATIONSHIP_TYPES_DELETE'
    ];
    const contentPermissionIds = contentPermissionCodes.map(code => permissionCodeMap.get(code));

    // Kullanıcı ve rol izinleri
    const userRolePermissionCodes = [
      'USERS_VIEW', 'USERS_CREATE', 'USERS_UPDATE', 'USERS_DELETE',
      'ROLES_VIEW', 'ROLES_CREATE', 'ROLES_UPDATE', 'ROLES_DELETE'
    ];
    const userRolePermissionIds = userRolePermissionCodes.map(code => permissionCodeMap.get(code));

    // Roller oluştur
  const roleAdmin = await (await import('../models/Role')).default.create({
      name: 'Sistem Yöneticisi',
      code: 'SYSTEM_ADMIN',
      description: 'Tüm yetkilere sahip sistem yöneticisi',
      permissions: allPermissionIds,
      isActive: true
    });

    const roleStandardUser = await (await import('../models/Role')).default.create({
      name: 'Standart Kullanıcı',
      code: 'STANDARD_USER',
      description: 'Sadece görüntüleme yetkilerine sahip standart kullanıcı',
      permissions: viewPermissionIds,
      isActive: true
    });

    const roleProductManager = await (await import('../models/Role')).default.create({
      name: 'Ürün Yöneticisi',
      code: 'PRODUCT_MANAGER',
      description: 'Ürün yönetimi ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...productPermissionIds],
      isActive: true
    });

    const roleContentManager = await (await import('../models/Role')).default.create({
      name: 'İçerik Yöneticisi',
      code: 'CONTENT_MANAGER',
      description: 'İçerik yönetimi ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...contentPermissionIds],
      isActive: true
    });

    const roleUserManager = await (await import('../models/Role')).default.create({
      name: 'Kullanıcı Yöneticisi',
      code: 'USER_MANAGER',
      description: 'Kullanıcı ve rol yönetimi ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...userRolePermissionIds],
      isActive: true
    });

  const roleBayi = await (await import('../models/Role')).default.create({
      name: 'Bayi',
      code: 'DEALER',
      description: 'Ürünleri görüntüleme ve oluşturma yetkisine sahip bayi rolü',
      permissions: [...viewPermissionIds, permissionCodeMap.get('ITEMS_CREATE')],
      isActive: true
    });

    console.log('Roller başarıyla oluşturuldu');
    
    // 3. Kullanıcılar ve Adresler
    const adminPassword = 'Admin123!';
    const musteriPassword = 'Musteri123!';
    const bayiPassword = 'Bayi123!';
    const kargoPassword = 'Kargo123!';
    const muhasebePassword = 'Muhasebe123!';

  const admin = await User.create({
    name: 'Admin Kullanıcı',
    email: 'admin@demo.com',
    password: adminPassword,
    isAdmin: true,
    isActive: true,
    lastLogin: null,
    role: roleAdmin._id
  });
  const musteri = await User.create({
    name: 'Ahmet Yılmaz',
    email: 'ahmet@demo.com',
    password: musteriPassword,
    isAdmin: false,
    isActive: true,
    lastLogin: null,
      role: roleStandardUser._id
  });
  const bayi = await User.create({
    name: 'Bayi Elektronik',
    email: 'bayi@demo.com',
    password: bayiPassword,
    isAdmin: false,
    isActive: true,
    lastLogin: null,
    role: roleBayi._id
  });
  const kargo = await User.create({
    name: 'Kargo Personeli',
    email: 'kargo@demo.com',
    password: kargoPassword,
    isAdmin: false,
    isActive: true,
    lastLogin: null,
      role: roleStandardUser._id
  });
  const muhasebe = await User.create({
    name: 'Muhasebe Yetkilisi',
    email: 'muhasebe@demo.com',
    password: muhasebePassword,
    isAdmin: false,
    isActive: true,
    lastLogin: null,
      role: roleStandardUser._id
    });
    
    // 4. AttributeGroup'ları Oluştur
    const attrGroupTeknik = await AttributeGroup.create({
      name: 'Teknik Özellikler',
      code: 'TEKNIK',
      description: 'Ürünlerin teknik özellikleri',
      isActive: true
    });
    
    const attrGroupFiziksel = await AttributeGroup.create({
      name: 'Fiziksel Özellikler',
      code: 'FIZIKSEL',
      description: 'Ürünlerin fiziksel özellikleri',
      isActive: true
    });
    
    const attrGroupTicari = await AttributeGroup.create({
      name: 'Ticari Bilgiler',
      code: 'TICARI',
      description: 'Ürünlerin ticari bilgileri',
      isActive: true
    });
    
    const attrGroupSiparis = await AttributeGroup.create({
      name: 'Sipariş Bilgileri',
      code: 'SIPARIS',
      description: 'Sipariş ile ilgili bilgiler',
      isActive: true
    });
    
    const attrGroupKargo = await AttributeGroup.create({
      name: 'Kargo Bilgileri',
      code: 'KARGO',
      description: 'Kargo ile ilgili bilgiler',
      isActive: true
    });
    
    const attrGroupFatura = await AttributeGroup.create({
      name: 'Fatura Bilgileri',
      code: 'FATURA',
      description: 'Fatura ile ilgili bilgiler',
      isActive: true
    });

    // 5. Attribute ve AttributeGroup (örnekler)
    const attrMarka = await Attribute.create({
      name: 'Marka', 
      code: 'MARKA', 
      type: AttributeType.SELECT, 
      description: 'Ürün markası', 
      isRequired: true, 
      options: ['Samsung', 'Apple', 'Lenovo', 'Dell', 'Xiaomi', 'Huawei'], 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    const attrModel = await Attribute.create({
      name: 'Model', 
      code: 'MODEL', 
      type: AttributeType.TEXT, 
      description: 'Ürün modeli', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    const attrRam = await Attribute.create({
      name: 'RAM', 
      code: 'RAM', 
      type: AttributeType.NUMBER, 
      description: 'Bellek (GB)', 
      isRequired: true, 
      options: [], 
      validations: { min: 2, max: 128 }, 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    const attrDepolama = await Attribute.create({
      name: 'Depolama', 
      code: 'DEPOLAMA', 
      type: AttributeType.NUMBER, 
      description: 'Depolama (GB)', 
      isRequired: true, 
      options: [], 
      validations: { min: 16, max: 4096 }, 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    const attrEkran = await Attribute.create({
      name: 'Ekran Boyutu', 
      code: 'EKRAN', 
      type: AttributeType.NUMBER, 
      description: 'Ekran boyutu (inç)', 
      isRequired: false, 
      options: [], 
      validations: { min: 4, max: 18 }, 
      attributeGroup: attrGroupFiziksel._id,
      isActive: true
    });
    const attrIsletimSistemi = await Attribute.create({
      name: 'İşletim Sistemi', 
      code: 'OS', 
      type: AttributeType.SELECT, 
      description: 'İşletim sistemi', 
      isRequired: true, 
      options: ['Android', 'iOS', 'Windows', 'MacOS'], 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    const attrCikisYili = await Attribute.create({
      name: 'Çıkış Yılı', 
      code: 'CIKIS_YILI', 
      type: AttributeType.NUMBER, 
      description: 'Çıkış yılı', 
      isRequired: false, 
      options: [], 
      validations: { min: 2015, max: 2024 }, 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    const attrRenk = await Attribute.create({
      name: 'Renk', 
      code: 'RENK', 
      type: AttributeType.SELECT, 
      description: 'Renk', 
      isRequired: false, 
      options: ['Siyah', 'Beyaz', 'Gri', 'Mavi', 'Kırmızı'], 
      attributeGroup: attrGroupFiziksel._id,
      isActive: true
    });
    const attrGaranti = await Attribute.create({
      name: 'Garanti Süresi', 
      code: 'GARANTI_SURE', 
      type: AttributeType.NUMBER, 
      description: 'Garanti süresi (ay)', 
      isRequired: false, 
      options: [], 
      validations: { min: 0, max: 60 }, 
      attributeGroup: attrGroupTicari._id,
      isActive: true
    });
    const attrFiyat = await Attribute.create({
      name: 'Fiyat', 
      code: 'FIYAT', 
      type: AttributeType.NUMBER, 
      description: 'Ürün fiyatı', 
      isRequired: true, 
      options: [], 
      validations: { min: 1000, max: 200000 }, 
      attributeGroup: attrGroupTicari._id,
      isActive: true
    });
    const attrStok = await Attribute.create({
      name: 'Stok Durumu', 
      code: 'STOK', 
      type: AttributeType.BOOLEAN, 
      description: 'Stokta var mı?', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupTicari._id,
      isActive: true
    });
    const attrSiparisNo = await Attribute.create({
      name: 'Sipariş Numarası', 
      code: 'SIPARIS_NO', 
      type: AttributeType.TEXT, 
      description: 'Sipariş numarası', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupSiparis._id,
      isActive: true
    });
    const attrSiparisTarihi = await Attribute.create({
      name: 'Sipariş Tarihi', 
      code: 'SIPARIS_TARIHI', 
      type: AttributeType.DATE, 
      description: 'Sipariş tarihi', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupSiparis._id,
      isActive: true
    });
    const attrSiparisDurumu = await Attribute.create({
      name: 'Sipariş Durumu', 
      code: 'SIPARIS_DURUMU', 
      type: AttributeType.SELECT, 
      description: 'Sipariş durumu', 
      isRequired: true, 
      options: ['Hazırlanıyor', 'Kargoda', 'Teslim Edildi', 'İptal Edildi'], 
      attributeGroup: attrGroupSiparis._id,
      isActive: true
    });
    const attrToplamTutar = await Attribute.create({
      name: 'Toplam Tutar', 
      code: 'TOPLAM_TUTAR', 
      type: AttributeType.NUMBER, 
      description: 'Sipariş toplam tutarı', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupSiparis._id,
      isActive: true
    });
    const attrOdemeTipi = await Attribute.create({
      name: 'Ödeme Tipi', 
      code: 'ODEME_TIPI', 
      type: AttributeType.SELECT, 
      description: 'Ödeme tipi', 
      isRequired: true, 
      options: ['Kredi Kartı', 'Havale', 'Kapıda Ödeme'], 
      attributeGroup: attrGroupSiparis._id,
      isActive: true
    });
    const attrOdemeDurumu = await Attribute.create({
      name: 'Ödeme Durumu', 
      code: 'ODEME_DURUMU', 
      type: AttributeType.SELECT, 
      description: 'Ödeme durumu', 
      isRequired: true, 
      options: ['Ödendi', 'Bekliyor', 'İptal'], 
      attributeGroup: attrGroupSiparis._id,
      isActive: true
    });
    const attrKargoFirma = await Attribute.create({
      name: 'Kargo Firması', 
      code: 'KARGO_FIRMA', 
      type: AttributeType.SELECT, 
      description: 'Kargo firması', 
      isRequired: true, 
      options: ['Yurtiçi', 'Aras', 'MNG', 'Sürat'], 
      attributeGroup: attrGroupKargo._id,
      isActive: true
    });
    const attrKargoTakip = await Attribute.create({
      name: 'Kargo Takip No', 
      code: 'KARGO_TAKIP', 
      type: AttributeType.TEXT, 
      description: 'Kargo takip numarası', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupKargo._id,
      isActive: true
    });
    const attrKargoDurum = await Attribute.create({
      name: 'Kargo Durumu', 
      code: 'KARGO_DURUM', 
      type: AttributeType.SELECT, 
      description: 'Kargo durumu', 
      isRequired: true, 
      options: ['Hazırlanıyor', 'Yolda', 'Teslim Edildi'], 
      attributeGroup: attrGroupKargo._id,
      isActive: true
    });
    const attrFaturaNo = await Attribute.create({
      name: 'Fatura Numarası', 
      code: 'FATURA_NO', 
      type: AttributeType.TEXT, 
      description: 'Fatura numarası', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupFatura._id,
      isActive: true
    });
    const attrFaturaTarihi = await Attribute.create({
      name: 'Fatura Tarihi', 
      code: 'FATURA_TARIHI', 
      type: AttributeType.DATE, 
      description: 'Fatura tarihi', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupFatura._id,
      isActive: true
    });
    const attrVergiNo = await Attribute.create({
      name: 'Vergi Numarası', 
      code: 'VERGI_NO', 
      type: AttributeType.TEXT, 
      description: 'Vergi numarası', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupFatura._id,
      isActive: true
    });
    const attrVergiDairesi = await Attribute.create({
      name: 'Vergi Dairesi', 
      code: 'VERGI_DAIRESI', 
      type: AttributeType.TEXT, 
      description: 'Vergi dairesi', 
      isRequired: true, 
      options: [], 
      attributeGroup: attrGroupFatura._id,
      isActive: true
    });

    // 6. Category, Family ve ItemType hiyerarşisini oluşturma (Yeni sıralama)
    // NOT: Önce Category, sonra Family, sonra ItemType eklemeliyiz
    // çünkü Family oluşturulurken Category, ItemType oluşturulurken Family zorunlu oldu

    // 6.1 Kategoriler
    const categoryGenel = await Category.create({
      name: 'Genel', 
      code: 'GENEL', 
      description: 'Genel amaçlı kategori',
      family: null, // Geçici olarak null, daha sonra güncellenecek
      attributeGroup: attrGroupTeknik._id,  
      isActive: true
    });
    
    const categoryTelefon = await Category.create({
      name: 'Telefonlar', 
      code: 'TEL', 
      description: 'Tüm telefonlar', 
      family: null, // Geçici olarak null, Family oluşturulduğunda güncellenecek
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    
    const categoryAkilliTelefon = await Category.create({
      name: 'Akıllı Telefonlar', 
      code: 'AKILLI_TEL', 
      description: 'Akıllı telefonlar', 
      family: null, // Daha sonra güncellenecek
      parent: categoryTelefon._id, 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    
    const categoryAndroid = await Category.create({
      name: 'Android Telefonlar', 
      code: 'ANDROID_TEL', 
      description: 'Android tabanlı telefonlar', 
      family: null, // Daha sonra güncellenecek
      parent: categoryAkilliTelefon._id, 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    
    const categoryIOS = await Category.create({
      name: 'iOS Telefonlar', 
      code: 'IOS_TEL', 
      description: 'iOS tabanlı telefonlar', 
      family: null, // Daha sonra güncellenecek
      parent: categoryAkilliTelefon._id, 
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    
    const categoryTablet = await Category.create({
      name: 'Tabletler', 
      code: 'TABLET', 
      description: 'Tüm tabletler', 
      family: null, // Daha sonra güncellenecek
      attributeGroup: attrGroupFiziksel._id,
      isActive: true
    });
    
    const categoryLaptop = await Category.create({
      name: 'Laptoplar', 
      code: 'LAPTOP', 
      description: 'Tüm laptoplar', 
      family: null, // Daha sonra güncellenecek
      attributeGroup: attrGroupTeknik._id,
      isActive: true
    });
    
    const categoryAksesuar = await Category.create({
      name: 'Aksesuarlar', 
      code: 'AKSESUAR', 
      description: 'Tüm aksesuarlar', 
      family: null, // Daha sonra güncellenecek
      attributeGroup: attrGroupFiziksel._id,
      isActive: true
    });
    
    // 6.2 Aileler (Family)
    // Elektronik Ailesi
    const familyElektronik = await Family.create({
      name: 'Elektronik Ürünler', 
      code: 'ELEKTRONIK', 
      description: 'Tüm elektronik ürünler', 
      itemType: null, // Geçici olarak null, ItemType oluşturulduğunda güncellenecek
      category: categoryGenel._id,
      isActive: true
    });
    
    // Her family için uygun kategoriyi atayalım
    const familyTuketici = await Family.create({
      name: 'Tüketici Elektroniği', 
      code: 'TUKETICI', 
      description: 'Tüm tüketici elektroniği',
      itemType: null, // Daha sonra güncellenecek
      category: categoryGenel._id,
      attributeGroups: [attrGroupTeknik._id, attrGroupFiziksel._id],
      isActive: true
    });
    
    const familyMobil = await Family.create({
      name: 'Mobil Cihazlar', 
      code: 'MOBIL', 
      description: 'Mobil cihazlar', 
      itemType: null, // Daha sonra güncellenecek
      category: categoryGenel._id,
      attributeGroups: [attrGroupTeknik._id, attrGroupFiziksel._id],
      isActive: true
    });
    
    const familyAkilliTelefon = await Family.create({
      name: 'Akıllı Telefonlar', 
      code: 'AKILLI_TEL', 
      description: 'Akıllı telefonlar', 
      itemType: null, // Daha sonra güncellenecek
      category: categoryAkilliTelefon._id,
      attributeGroups: [attrGroupTeknik._id, attrGroupFiziksel._id],
      isActive: true
    });
    
    const familyTablet = await Family.create({
      name: 'Tabletler', 
      code: 'TABLET', 
      description: 'Tabletler', 
      itemType: null, // Daha sonra güncellenecek
      category: categoryTablet._id,
      attributeGroups: [attrGroupTeknik._id, attrGroupFiziksel._id],
      isActive: true
    });
    
    const familyLaptop = await Family.create({
      name: 'Laptoplar', 
      code: 'LAPTOP', 
      description: 'Tüm laptoplar', 
      itemType: null, // Daha sonra güncellenecek
      category: categoryLaptop._id,
      attributeGroups: [attrGroupTeknik._id, attrGroupFiziksel._id],
      isActive: true
    });
    
    // Aksesuar ve diğer aileler
    const familyAksesuar = await Family.create({
      name: 'Aksesuarlar', 
      code: 'AKSESUARLAR', 
      description: 'Tüm aksesuarlar', 
      itemType: null, // Daha sonra güncellenecek
      category: categoryAksesuar._id,
      attributeGroups: [attrGroupFiziksel._id],
      isActive: true
    });
    
    // Genel aile (fatura, kargo, garanti, adres için)
    const familyGenel = await Family.create({
      name: 'Genel', 
      code: 'GENEL', 
      description: 'Genel amaçlı family', 
      itemType: null, // Daha sonra güncellenecek
      category: categoryGenel._id,
      isActive: true
    });
    
    // 6.3 Şimdi Category'lerin family referanslarını güncelleyelim
    await Category.findByIdAndUpdate(categoryTelefon._id, { family: familyMobil._id });
    await Category.findByIdAndUpdate(categoryAkilliTelefon._id, { family: familyAkilliTelefon._id });
    await Category.findByIdAndUpdate(categoryAndroid._id, { family: familyAkilliTelefon._id });
    await Category.findByIdAndUpdate(categoryIOS._id, { family: familyAkilliTelefon._id });
    await Category.findByIdAndUpdate(categoryTablet._id, { family: familyTablet._id });
    await Category.findByIdAndUpdate(categoryLaptop._id, { family: familyLaptop._id });
    await Category.findByIdAndUpdate(categoryAksesuar._id, { family: familyAksesuar._id });
    await Category.findByIdAndUpdate(categoryGenel._id, { family: familyGenel._id });
    
    // 6.4 ItemType'lar
  const itemTypeElektronik = await ItemType.create({
    name: 'Elektronik Eşya',
    code: 'ELEKTRONIK',
    description: 'Tüm elektronik cihazlar',
      family: familyElektronik._id,
      attributes: [
        attrMarka._id, attrModel._id, attrRam._id, attrDepolama._id, attrEkran._id,
        attrIsletimSistemi._id, attrCikisYili._id, attrRenk._id, attrGaranti._id,
        attrFiyat._id, attrStok._id
      ],
      attributeGroups: [attrGroupTeknik._id, attrGroupFiziksel._id, attrGroupTicari._id],
    isActive: true
  });
    
  const itemTypeFatura = await ItemType.create({
    name: 'Fatura',
    code: 'FATURA',
    description: 'Fatura belgeleri',
      family: familyGenel._id,
      attributes: [
        attrFaturaNo._id, attrFaturaTarihi._id, attrVergiNo._id, attrVergiDairesi._id
      ],
      attributeGroups: [attrGroupFatura._id],
    isActive: true
  });
    
  const itemTypeKargo = await ItemType.create({
    name: 'Kargo',
    code: 'KARGO',
    description: 'Kargo işlemleri',
      family: familyGenel._id,
      attributes: [
        attrKargoFirma._id, attrKargoTakip._id, attrKargoDurum._id
      ],
      attributeGroups: [attrGroupKargo._id],
    isActive: true
  });
    
  const itemTypeSiparis = await ItemType.create({
    name: 'Sipariş',
    code: 'SIPARIS',
    description: 'Sipariş kayıtları',
      family: familyGenel._id,
      attributes: [
        attrSiparisNo._id, attrSiparisTarihi._id, attrSiparisDurumu._id,
        attrToplamTutar._id, attrOdemeTipi._id, attrOdemeDurumu._id
      ],
      attributeGroups: [attrGroupSiparis._id, attrGroupTicari._id],
    isActive: true
  });
    
  const itemTypeGaranti = await ItemType.create({
    name: 'Garanti Belgesi',
    code: 'GARANTI',
    description: 'Garanti belgeleri',
      family: familyGenel._id,
      attributes: [
        attrGaranti._id, attrMarka._id, attrModel._id
      ],
      attributeGroups: [attrGroupTicari._id],
    isActive: true
  });
    
  const itemTypeAksesuar = await ItemType.create({
    name: 'Aksesuar',
    code: 'AKSESUAR',
    description: 'Ekstra aksesuarlar',
      family: familyAksesuar._id,
      attributes: [
        attrMarka._id, attrModel._id, attrRenk._id, attrFiyat._id, attrStok._id
      ],
      attributeGroups: [attrGroupFiziksel._id, attrGroupTicari._id],
    isActive: true
  });
    
  const itemTypeAdres = await ItemType.create({
    name: 'Adres',
    code: 'ADRES',
    description: 'Adres kayıtları',
      family: familyGenel._id,
    attributes: [],
    isActive: true
  });

    // 6.5 Family'lerin itemType referanslarını güncelleyelim
    await Family.findByIdAndUpdate(familyElektronik._id, { itemType: itemTypeElektronik._id });
    await Family.findByIdAndUpdate(familyTuketici._id, { itemType: itemTypeElektronik._id });
    await Family.findByIdAndUpdate(familyMobil._id, { itemType: itemTypeElektronik._id });
    await Family.findByIdAndUpdate(familyAkilliTelefon._id, { itemType: itemTypeElektronik._id });
    await Family.findByIdAndUpdate(familyTablet._id, { itemType: itemTypeElektronik._id });
    await Family.findByIdAndUpdate(familyLaptop._id, { itemType: itemTypeElektronik._id });
    await Family.findByIdAndUpdate(familyAksesuar._id, { itemType: itemTypeAksesuar._id });
    
    // 7. Item (ürünler, aksesuarlar, siparişler, faturalar, kargolar, garanti belgeleri, adresler)
    // Elektronik ürünler
    const itemS23 = await Item.create({
      name: 'Samsung Galaxy S23', 
      code: 'SGS23-256GB-BLK', 
      itemType: itemTypeElektronik._id, 
      family: familyAkilliTelefon._id, 
      category: categoryAndroid._id, 
      attributes: {
        Marka: 'Samsung', 
        Model: 'Galaxy S23', 
        RAM: 8, 
        Depolama: 256, 
        'Ekran Boyutu': 6.1, 
        'İşletim Sistemi': 'Android', 
        'Çıkış Yılı': 2023, 
        Renk: 'Siyah', 
        'Garanti Süresi': 24, 
        Fiyat: 35000, 
        'Stok Durumu': true
      }, 
      isActive: true
    });
    
    const itemIphone = await Item.create({
      name: 'iPhone 15 Pro', 
      code: 'IPH15PRO-512GB-GRY', 
      itemType: itemTypeElektronik._id, 
      family: familyAkilliTelefon._id, 
      category: categoryIOS._id, 
      attributes: {
        Marka: 'Apple', 
        Model: 'iPhone 15 Pro', 
        RAM: 12, 
        Depolama: 512, 
        'Ekran Boyutu': 6.1, 
        'İşletim Sistemi': 'iOS', 
        'Çıkış Yılı': 2023, 
        Renk: 'Gri', 
        'Garanti Süresi': 24, 
        Fiyat: 65000, 
        'Stok Durumu': true
      }, 
      isActive: true
    });
    
    const itemTablet = await Item.create({
      name: 'Lenovo Tab M10', 
      code: 'LENOVO-TAB-M10', 
      itemType: itemTypeElektronik._id, 
      family: familyTablet._id, 
      category: categoryTablet._id, 
      attributes: {
        Marka: 'Lenovo', 
        Model: 'Tab M10', 
        RAM: 4, 
        Depolama: 64, 
        'Ekran Boyutu': 10.1, 
        'İşletim Sistemi': 'Android', 
        'Çıkış Yılı': 2022, 
        Renk: 'Beyaz', 
        'Garanti Süresi': 12, 
        Fiyat: 9000, 
        'Stok Durumu': true
      }, 
      isActive: true
    });
    
  // Aksesuarlar
  const itemKilic = await Item.create({
      name: 'Orijinal Kılıf', 
      code: 'KILIF-SGS23', 
      itemType: itemTypeAksesuar._id, 
      family: familyAksesuar._id, 
      category: categoryAksesuar._id, 
      attributes: {
        Marka: 'Samsung', 
        Model: 'Galaxy S23 Kılıfı', 
        Renk: 'Siyah', 
        Fiyat: 500, 
        'Stok Durumu': true
      }, 
      isActive: true
    });
    
  const itemSarj = await Item.create({
      name: 'Hızlı Şarj Cihazı', 
      code: 'SARJ-IPH15', 
      itemType: itemTypeAksesuar._id, 
      family: familyAksesuar._id, 
      category: categoryAksesuar._id, 
      attributes: {
        Marka: 'Apple', 
        Model: 'iPhone 15 Pro Şarj', 
        Renk: 'Beyaz', 
        Fiyat: 800, 
        'Stok Durumu': true
      }, 
      isActive: true
    });
    
  // Garanti belgeleri
  const itemGarantiS23 = await Item.create({
      name: 'Garanti Belgesi - S23', 
      code: 'GARANTI-S23', 
      itemType: itemTypeGaranti._id, 
      family: familyGenel._id, 
      category: categoryGenel._id, 
      attributes: {
        'Garanti Süresi': 24, 
        Marka: 'Samsung', 
        Model: 'Galaxy S23'
      }, 
      isActive: true
    });
    
  // Siparişler
  const itemSiparis = await Item.create({
      name: 'Sipariş #1001', 
      code: 'SIP-1001', 
      itemType: itemTypeSiparis._id, 
      family: familyGenel._id, 
      category: categoryGenel._id, 
      attributes: {
        'Sipariş Numarası': '1001', 
        'Sipariş Tarihi': new Date('2024-06-01'), 
        'Sipariş Durumu': 'Kargoda', 
        'Toplam Tutar': 35800, 
        'Ödeme Tipi': 'Kredi Kartı', 
        'Ödeme Durumu': 'Ödendi'
      }, 
      isActive: true
    });
    
  // Faturalar
  const itemFatura = await Item.create({
      name: 'Fatura #FTR-1001', 
      code: 'FTR-1001', 
      itemType: itemTypeFatura._id, 
      family: familyGenel._id, 
      category: categoryGenel._id, 
      attributes: {
        'Fatura Numarası': 'FTR-1001', 
        'Fatura Tarihi': new Date('2024-06-01'), 
        'Vergi Numarası': '1234567890', 
        'Vergi Dairesi': 'Kadıköy', 
        'Fatura Tutarı': 35800
      }, 
      isActive: true
    });
    
  // Kargo
  const itemKargo = await Item.create({
      name: 'Kargo #YK123456789', 
      code: 'KARGO-1001', 
      itemType: itemTypeKargo._id, 
      family: familyGenel._id, 
      category: categoryGenel._id, 
      attributes: {
        'Kargo Firması': 'Yurtiçi', 
        'Kargo Takip No': 'YK123456789', 
        'Kargo Durumu': 'Yolda'
      }, 
      isActive: true
    });

    // Adresler
  const adresEv = await Item.create({
    name: 'Ahmet Yılmaz Ev',
    code: 'ADRES-EV-001',
    itemType: itemTypeAdres._id,
    family: familyGenel._id,
    category: categoryGenel._id,
    attributes: {
      'Adres Başlığı': 'Ev',
      'Açık Adres': 'İstanbul, Kadıköy, 34710',
      'Şehir': 'İstanbul',
      'İlçe': 'Kadıköy',
      'Posta Kodu': '34710',
      'Ülke': 'Türkiye'
    },
    isActive: true
  });
    
  const adresIs = await Item.create({
    name: 'Ahmet Yılmaz İş',
    code: 'ADRES-IS-001',
    itemType: itemTypeAdres._id,
    family: familyGenel._id,
    category: categoryGenel._id,
    attributes: {
      'Adres Başlığı': 'İş',
      'Açık Adres': 'İstanbul, Şişli, 34394',
      'Şehir': 'İstanbul',
      'İlçe': 'Şişli',
      'Posta Kodu': '34394',
      'Ülke': 'Türkiye'
    },
    isActive: true
  });
    
  const adresFatura = await Item.create({
    name: 'Ahmet Yılmaz Fatura',
    code: 'ADRES-FATURA-001',
    itemType: itemTypeAdres._id,
    family: familyGenel._id,
    category: categoryGenel._id,
    attributes: {
      'Adres Başlığı': 'Fatura',
      'Açık Adres': 'İstanbul, Kadıköy, 34710',
      'Şehir': 'İstanbul',
      'İlçe': 'Kadıköy',
      'Posta Kodu': '34710',
      'Ülke': 'Türkiye'
    },
    isActive: true
  });

    // 8. RelationshipType ve Relationship (örnekler)
  const relTypeKullaniciAdres = await RelationshipType.create({
      code: 'kullanici-adres', 
      name: 'Kullanıcı-Adres', 
      isDirectional: true, 
      allowedSourceTypes: ['User'], 
      allowedTargetTypes: ['Item']
    });
    
  const relTypeSiparisUrun = await RelationshipType.create({
      code: 'siparis-urun', 
      name: 'Sipariş-Ürün', 
      isDirectional: true, 
      allowedSourceTypes: ['Siparis'], 
      allowedTargetTypes: ['Elektronik Eşya']
    });
    
  const relTypeSiparisFatura = await RelationshipType.create({
      code: 'siparis-fatura', 
      name: 'Sipariş-Fatura', 
      isDirectional: true, 
      allowedSourceTypes: ['Siparis'], 
      allowedTargetTypes: ['Fatura']
    });
    
  const relTypeSiparisKargo = await RelationshipType.create({
      code: 'siparis-kargo', 
      name: 'Sipariş-Kargo', 
      isDirectional: true, 
      allowedSourceTypes: ['Siparis'], 
      allowedTargetTypes: ['Kargo']
    });
    
  const relTypeUrunGaranti = await RelationshipType.create({
      code: 'urun-garanti', 
      name: 'Ürün-Garanti', 
      isDirectional: true, 
      allowedSourceTypes: ['Elektronik Eşya'], 
      allowedTargetTypes: ['Garanti Belgesi']
    });
    
  const relTypeUrunAksesuar = await RelationshipType.create({
      code: 'urun-aksesuar', 
      name: 'Ürün-Aksesuar', 
      isDirectional: true, 
      allowedSourceTypes: ['Elektronik Eşya'], 
      allowedTargetTypes: ['Aksesuar']
    });
    
  const relTypeKategoriAltKategori = await RelationshipType.create({
      code: 'kategori-altkategori', 
      name: 'Kategori-AltKategori', 
      isDirectional: true, 
      allowedSourceTypes: ['Category'], 
      allowedTargetTypes: ['Category']
  });

  // Kullanıcı-adres ilişkileri
  await Relationship.create({
      relationshipTypeId: relTypeKullaniciAdres._id, 
      sourceEntityId: musteri._id, 
      sourceEntityType: 'User', 
      targetEntityId: adresEv._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  await Relationship.create({
      relationshipTypeId: relTypeKullaniciAdres._id, 
      sourceEntityId: musteri._id, 
      sourceEntityType: 'User', 
      targetEntityId: adresIs._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  // Sipariş-ürün ilişkisi (adet, birim fiyat, toplam fiyat attribute ile)
  await Relationship.create({
      relationshipTypeId: relTypeSiparisUrun._id, 
      sourceEntityId: itemSiparis._id, 
      sourceEntityType: 'Item', 
      targetEntityId: itemS23._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      attributes: { adet: 1, birimFiyat: 35000, toplamFiyat: 35000 }, 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  await Relationship.create({
      relationshipTypeId: relTypeSiparisUrun._id, 
      sourceEntityId: itemSiparis._id, 
      sourceEntityType: 'Item', 
      targetEntityId: itemKilic._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      attributes: { adet: 1, birimFiyat: 500, toplamFiyat: 500 }, 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  // Sipariş-fatura, sipariş-kargo
  await Relationship.create({
      relationshipTypeId: relTypeSiparisFatura._id, 
      sourceEntityId: itemSiparis._id, 
      sourceEntityType: 'Item', 
      targetEntityId: itemFatura._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  await Relationship.create({
      relationshipTypeId: relTypeSiparisKargo._id, 
      sourceEntityId: itemSiparis._id, 
      sourceEntityType: 'Item', 
      targetEntityId: itemKargo._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  // Ürün-garanti, ürün-aksesuar
  await Relationship.create({
      relationshipTypeId: relTypeUrunGaranti._id, 
      sourceEntityId: itemS23._id, 
      sourceEntityType: 'Item', 
      targetEntityId: itemGarantiS23._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  await Relationship.create({
      relationshipTypeId: relTypeUrunAksesuar._id, 
      sourceEntityId: itemS23._id, 
      sourceEntityType: 'Item', 
      targetEntityId: itemKilic._id, 
      targetEntityType: 'Item', 
      status: 'active', 
      createdBy: admin._id, 
      updatedBy: admin._id
    });
    
  // Kategori-altkategori
  await Relationship.create({
      relationshipTypeId: relTypeKategoriAltKategori._id, 
      sourceEntityId: categoryTelefon._id, 
      sourceEntityType: 'Category', 
      targetEntityId: categoryAkilliTelefon._id, 
      targetEntityType: 'Category', 
      status: 'active', 
      createdBy: admin._id, 
      updatedBy: admin._id
  });

  console.log('Ultra detaylı demo veri başarıyla eklendi!');
  mongoose.connection.close();
  } catch (error) {
    console.error('Demo veri eklenirken bir hata oluştu:', error);
    mongoose.connection.close();
  }
}

seed().catch(console.error); 