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
      { name: 'Sistem Ayarları', code: 'SETTINGS', description: 'Sistem ayarlarının yönetimi için izinler', isActive: true },
      { name: 'Stok Yönetimi', code: 'INVENTORY', description: 'Stok yönetimi için izinler', isActive: true },
      { name: 'Fiyatlandırma Yönetimi', code: 'PRICING', description: 'Fiyat yönetimi için izinler', isActive: true },
      { name: 'Kampanya Yönetimi', code: 'CAMPAIGNS', description: 'Kampanya yönetimi için izinler', isActive: true },
      { name: 'Bayi Yönetimi', code: 'DEALERS', description: 'Bayi yönetimi için izinler', isActive: true },
      { name: 'Raporlama', code: 'REPORTING', description: 'Raporlama için izinler', isActive: true }
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

      // Stok Yönetimi İzinleri
      { name: 'Stok Görüntüleme', code: 'INVENTORY_VIEW', groupCode: 'INVENTORY', description: 'Stok bilgilerini görüntüleme izni' },
      { name: 'Stok Güncelleme', code: 'INVENTORY_UPDATE', groupCode: 'INVENTORY', description: 'Stok bilgilerini güncelleme izni' },
      { name: 'Stok Transfer', code: 'INVENTORY_TRANSFER', groupCode: 'INVENTORY', description: 'Stok transferi yapabilme izni' },
      { name: 'Stok Raporlama', code: 'INVENTORY_REPORT', groupCode: 'INVENTORY', description: 'Stok raporlarını görüntüleme izni' },

      // Fiyatlandırma İzinleri
      { name: 'Fiyat Görüntüleme', code: 'PRICING_VIEW', groupCode: 'PRICING', description: 'Fiyat bilgilerini görüntüleme izni' },
      { name: 'Fiyat Güncelleme', code: 'PRICING_UPDATE', groupCode: 'PRICING', description: 'Fiyat bilgilerini güncelleme izni' },
      { name: 'Toplu Fiyat Güncelleme', code: 'PRICING_BULK_UPDATE', groupCode: 'PRICING', description: 'Toplu fiyat güncelleme izni' },
      { name: 'Fiyat Geçmişi Görüntüleme', code: 'PRICING_HISTORY', groupCode: 'PRICING', description: 'Fiyat geçmişini görüntüleme izni' },

      // Kampanya Yönetimi İzinleri
      { name: 'Kampanya Görüntüleme', code: 'CAMPAIGNS_VIEW', groupCode: 'CAMPAIGNS', description: 'Kampanyaları görüntüleme izni' },
      { name: 'Kampanya Oluşturma', code: 'CAMPAIGNS_CREATE', groupCode: 'CAMPAIGNS', description: 'Kampanya oluşturma izni' },
      { name: 'Kampanya Güncelleme', code: 'CAMPAIGNS_UPDATE', groupCode: 'CAMPAIGNS', description: 'Kampanya güncelleme izni' },
      { name: 'Kampanya Silme', code: 'CAMPAIGNS_DELETE', groupCode: 'CAMPAIGNS', description: 'Kampanya silme izni' },

      // Bayi Yönetimi İzinleri
      { name: 'Bayi Görüntüleme', code: 'DEALERS_VIEW', groupCode: 'DEALERS', description: 'Bayileri görüntüleme izni' },
      { name: 'Bayi Oluşturma', code: 'DEALERS_CREATE', groupCode: 'DEALERS', description: 'Bayi oluşturma izni' },
      { name: 'Bayi Güncelleme', code: 'DEALERS_UPDATE', groupCode: 'DEALERS', description: 'Bayi güncelleme izni' },
      { name: 'Bayi Silme', code: 'DEALERS_DELETE', groupCode: 'DEALERS', description: 'Bayi silme izni' },

      // Raporlama İzinleri
      { name: 'Satış Raporları', code: 'REPORTING_SALES', groupCode: 'REPORTING', description: 'Satış raporlarını görüntüleme izni' },
      { name: 'Stok Raporları', code: 'REPORTING_INVENTORY', groupCode: 'REPORTING', description: 'Stok raporlarını görüntüleme izni' },
      { name: 'Performans Raporları', code: 'REPORTING_PERFORMANCE', groupCode: 'REPORTING', description: 'Performans raporlarını görüntüleme izni' },
      { name: 'Özel Raporlar', code: 'REPORTING_CUSTOM', groupCode: 'REPORTING', description: 'Özel raporları görüntüleme izni' },

      // Mevcut diğer izinler
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

    // Stok yönetimi izinleri
    const inventoryPermissionCodes = [
      'INVENTORY_VIEW', 'INVENTORY_UPDATE', 'INVENTORY_TRANSFER', 'INVENTORY_REPORT'
    ];
    const inventoryPermissionIds = inventoryPermissionCodes.map(code => permissionCodeMap.get(code));

    // Fiyatlandırma izinleri
    const pricingPermissionCodes = [
      'PRICING_VIEW', 'PRICING_UPDATE', 'PRICING_BULK_UPDATE', 'PRICING_HISTORY'
    ];
    const pricingPermissionIds = pricingPermissionCodes.map(code => permissionCodeMap.get(code));

    // Kampanya yönetimi izinleri
    const campaignPermissionCodes = [
      'CAMPAIGNS_VIEW', 'CAMPAIGNS_CREATE', 'CAMPAIGNS_UPDATE', 'CAMPAIGNS_DELETE'
    ];
    const campaignPermissionIds = campaignPermissionCodes.map(code => permissionCodeMap.get(code));

    // Bayi yönetimi izinleri
    const dealerPermissionCodes = [
      'DEALERS_VIEW', 'DEALERS_CREATE', 'DEALERS_UPDATE', 'DEALERS_DELETE'
    ];
    const dealerPermissionIds = dealerPermissionCodes.map(code => permissionCodeMap.get(code));

    // Raporlama izinleri
    const reportingPermissionCodes = [
      'REPORTING_SALES', 'REPORTING_INVENTORY', 'REPORTING_PERFORMANCE', 'REPORTING_CUSTOM'
    ];
    const reportingPermissionIds = reportingPermissionCodes.map(code => permissionCodeMap.get(code));

    // Genişletilmiş roller
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

    const roleInventoryManager = await (await import('../models/Role')).default.create({
      name: 'Stok Yöneticisi',
      code: 'INVENTORY_MANAGER',
      description: 'Stok yönetimi ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...inventoryPermissionIds],
      isActive: true
    });

    const rolePricingManager = await (await import('../models/Role')).default.create({
      name: 'Fiyatlandırma Yöneticisi',
      code: 'PRICING_MANAGER',
      description: 'Ürün fiyatlandırması ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...pricingPermissionIds],
      isActive: true
    });

    const roleCampaignManager = await (await import('../models/Role')).default.create({
      name: 'Kampanya Yöneticisi',
      code: 'CAMPAIGN_MANAGER',
      description: 'Kampanya yönetimi ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...campaignPermissionIds],
      isActive: true
    });

    const roleDealerManager = await (await import('../models/Role')).default.create({
      name: 'Bayi Yöneticisi',
      code: 'DEALER_MANAGER',
      description: 'Bayi yönetimi ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...dealerPermissionIds],
      isActive: true
    });

    const roleReportingAnalyst = await (await import('../models/Role')).default.create({
      name: 'Rapor Analisti',
      code: 'REPORTING_ANALYST',
      description: 'Raporlama ve analiz ile ilgili yetkilere sahiptir',
      permissions: [...viewPermissionIds, ...reportingPermissionIds],
      isActive: true
    });

    const roleSupervisor = await (await import('../models/Role')).default.create({
      name: 'Süpervizör',
      code: 'SUPERVISOR',
      description: 'Hem ürün yönetimi hem stok hem fiyatlandırma yetkileri vardır',
      permissions: [...viewPermissionIds, ...productPermissionIds, ...inventoryPermissionIds, ...pricingPermissionIds],
      isActive: true
    });

    console.log('Roller başarıyla oluşturuldu');
    
    // 3. Kullanıcılar
    const adminPassword = 'Admin123!';
    const musteriPassword = 'Musteri123!';
    const bayiPassword = 'Bayi123!';
    const kargoPassword = 'Kargo123!';
    const muhasebePassword = 'Muhasebe123!';
    const genericPassword = 'Sifre123!';

    // Yönetim ekibi
    const admin = await User.create({
      name: 'Admin Kullanıcı',
      email: 'admin@demo.com',
      password: adminPassword,
      isAdmin: true,
      isActive: true,
      lastLogin: null,
      role: roleAdmin._id
    });

    const productManagerUser = await User.create({
      name: 'Ali Yıldız',
      email: 'aly@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleProductManager._id
    });

    const contentManagerUser = await User.create({
      name: 'Ayşe Kara',
      email: 'aysek@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleContentManager._id
    });

    const userManagerUser = await User.create({
      name: 'Mehmet Öztürk',
      email: 'mehmeto@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleUserManager._id
    });

    const stokMuduru = await User.create({
      name: 'Fatma Demir',
      email: 'fatmad@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleInventoryManager._id
    });

    const fiyatMuduru = await User.create({
      name: 'Kemal Yılmaz',
      email: 'kemaly@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: rolePricingManager._id
    });

    const kampanyaMuduru = await User.create({
      name: 'Zeynep Aydın',
      email: 'zeynepa@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleCampaignManager._id
    });

    const bayiMuduru = await User.create({
      name: 'Okan Şahin',
      email: 'okans@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleDealerManager._id
    });

    const analist = await User.create({
      name: 'Deniz Yıldırım',
      email: 'denizy@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleReportingAnalyst._id
    });

    const supervizor = await User.create({
      name: 'Selim Kaya',
      email: 'selimk@demo.com',
      password: genericPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleSupervisor._id
    });

    // Müşteriler
    const musteri = await User.create({
      name: 'Ahmet Yılmaz',
      email: 'ahmet@demo.com',
      password: musteriPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleStandardUser._id
    });

    const musteri2 = await User.create({
      name: 'Ayşe Öztürk',
      email: 'ayse@demo.com',
      password: musteriPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleStandardUser._id
    });

    const musteri3 = await User.create({
      name: 'Mehmet Kaya',
      email: 'mehmet@demo.com',
      password: musteriPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleStandardUser._id
    });

    // Bayiler
    const bayi = await User.create({
      name: 'Bayi Elektronik',
      email: 'bayi@demo.com',
      password: bayiPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleBayi._id
    });

    const bayi2 = await User.create({
      name: 'Teknoloji Center',
      email: 'tekno@demo.com',
      password: bayiPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleBayi._id
    });

    const bayi3 = await User.create({
      name: 'Dijital Dünya',
      email: 'dijital@demo.com',
      password: bayiPassword,
      isAdmin: false,
      isActive: true,
      lastLogin: null,
      role: roleBayi._id
    });

    // Diğer personel
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

    console.log('Kullanıcılar başarıyla oluşturuldu');
  } catch (error) {
    console.error('Demo veri eklenirken bir hata oluştu:', error);
  }
}

seed(); 