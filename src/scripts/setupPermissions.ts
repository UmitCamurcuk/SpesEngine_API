import mongoose from 'mongoose';
import Permission from '../models/Permission';
import PermissionGroup from '../models/PermissionGroup';
import Role from '../models/Role';

// İzin grupları
const permissionGroups = [
  { name: 'Öznitelik Yönetimi', code: 'ATTRIBUTES', description: 'Ürün özniteliklerinin yönetimi için izinler' },
  { name: 'Öznitelik Grubu Yönetimi', code: 'ATTRIBUTE_GROUPS', description: 'Öznitelik gruplarının yönetimi için izinler' },
  { name: 'Kategori Yönetimi', code: 'CATEGORIES', description: 'Ürün kategorilerinin yönetimi için izinler' },
  { name: 'Aile Yönetimi', code: 'FAMILIES', description: 'Ürün ailelerinin yönetimi için izinler' },
  { name: 'Geçmiş Yönetimi', code: 'HISTORY', description: 'Sistem geçmişinin görüntülenmesi için izinler' },
  { name: 'Ürün Yönetimi', code: 'ITEMS', description: 'Ürünlerin yönetimi için izinler' },
  { name: 'Ürün Tipi Yönetimi', code: 'ITEM_TYPES', description: 'Ürün tiplerinin yönetimi için izinler' },
  { name: 'İzin Yönetimi', code: 'PERMISSIONS', description: 'Sistem izinlerinin yönetimi için izinler' },
  { name: 'İzin Grubu Yönetimi', code: 'PERMISSION_GROUPS', description: 'İzin gruplarının yönetimi için izinler' },
  { name: 'İlişki Yönetimi', code: 'RELATIONSHIPS', description: 'Ürün ilişkilerinin yönetimi için izinler' },
  { name: 'İlişki Tipi Yönetimi', code: 'RELATIONSHIP_TYPES', description: 'İlişki tiplerinin yönetimi için izinler' },
  { name: 'Çeviri Yönetimi', code: 'TRANSLATIONS', description: 'Sistem çevirilerinin yönetimi için izinler' },
  { name: 'Kullanıcı Yönetimi', code: 'USERS', description: 'Kullanıcıların yönetimi için izinler' },
  { name: 'Rol Yönetimi', code: 'ROLES', description: 'Kullanıcı rollerinin yönetimi için izinler' }
];

// İzinler ve açıklamaları
const permissions = [
  // Öznitelik İzinleri
  { name: 'Öznitelikleri Görüntüleme', code: 'ATTRIBUTES_VIEW', group: 'ATTRIBUTES', description: 'Öznitelikleri görüntüleme izni' },
  { name: 'Öznitelik Oluşturma', code: 'ATTRIBUTES_CREATE', group: 'ATTRIBUTES', description: 'Yeni öznitelik oluşturma izni' },
  { name: 'Öznitelik Güncelleme', code: 'ATTRIBUTES_UPDATE', group: 'ATTRIBUTES', description: 'Mevcut öznitelikleri güncelleme izni' },
  { name: 'Öznitelik Silme', code: 'ATTRIBUTES_DELETE', group: 'ATTRIBUTES', description: 'Öznitelik silme izni' },

  // Öznitelik Grubu İzinleri
  { name: 'Öznitelik Gruplarını Görüntüleme', code: 'ATTRIBUTE_GROUPS_VIEW', group: 'ATTRIBUTE_GROUPS', description: 'Öznitelik gruplarını görüntüleme izni' },
  { name: 'Öznitelik Grubu Oluşturma', code: 'ATTRIBUTE_GROUPS_CREATE', group: 'ATTRIBUTE_GROUPS', description: 'Yeni öznitelik grubu oluşturma izni' },
  { name: 'Öznitelik Grubu Güncelleme', code: 'ATTRIBUTE_GROUPS_UPDATE', group: 'ATTRIBUTE_GROUPS', description: 'Mevcut öznitelik gruplarını güncelleme izni' },
  { name: 'Öznitelik Grubu Silme', code: 'ATTRIBUTE_GROUPS_DELETE', group: 'ATTRIBUTE_GROUPS', description: 'Öznitelik grubu silme izni' },

  // Kategori İzinleri
  { name: 'Kategorileri Görüntüleme', code: 'CATEGORIES_VIEW', group: 'CATEGORIES', description: 'Kategorileri görüntüleme izni' },
  { name: 'Kategori Oluşturma', code: 'CATEGORIES_CREATE', group: 'CATEGORIES', description: 'Yeni kategori oluşturma izni' },
  { name: 'Kategori Güncelleme', code: 'CATEGORIES_UPDATE', group: 'CATEGORIES', description: 'Mevcut kategorileri güncelleme izni' },
  { name: 'Kategori Silme', code: 'CATEGORIES_DELETE', group: 'CATEGORIES', description: 'Kategori silme izni' },

  // Aile İzinleri
  { name: 'Aileleri Görüntüleme', code: 'FAMILIES_VIEW', group: 'FAMILIES', description: 'Aileleri görüntüleme izni' },
  { name: 'Aile Oluşturma', code: 'FAMILIES_CREATE', group: 'FAMILIES', description: 'Yeni aile oluşturma izni' },
  { name: 'Aile Güncelleme', code: 'FAMILIES_UPDATE', group: 'FAMILIES', description: 'Mevcut aileleri güncelleme izni' },
  { name: 'Aile Silme', code: 'FAMILIES_DELETE', group: 'FAMILIES', description: 'Aile silme izni' },

  // Geçmiş İzinleri
  { name: 'Geçmişi Görüntüleme', code: 'HISTORY_VIEW', group: 'HISTORY', description: 'Sistem geçmişini görüntüleme izni' },

  // Ürün İzinleri
  { name: 'Ürünleri Görüntüleme', code: 'ITEMS_VIEW', group: 'ITEMS', description: 'Ürünleri görüntüleme izni' },
  { name: 'Ürün Oluşturma', code: 'ITEMS_CREATE', group: 'ITEMS', description: 'Yeni ürün oluşturma izni' },
  { name: 'Ürün Güncelleme', code: 'ITEMS_UPDATE', group: 'ITEMS', description: 'Mevcut ürünleri güncelleme izni' },
  { name: 'Ürün Silme', code: 'ITEMS_DELETE', group: 'ITEMS', description: 'Ürün silme izni' },

  // Ürün Tipi İzinleri
  { name: 'Ürün Tiplerini Görüntüleme', code: 'ITEM_TYPES_VIEW', group: 'ITEM_TYPES', description: 'Ürün tiplerini görüntüleme izni' },
  { name: 'Ürün Tipi Oluşturma', code: 'ITEM_TYPES_CREATE', group: 'ITEM_TYPES', description: 'Yeni ürün tipi oluşturma izni' },
  { name: 'Ürün Tipi Güncelleme', code: 'ITEM_TYPES_UPDATE', group: 'ITEM_TYPES', description: 'Mevcut ürün tiplerini güncelleme izni' },
  { name: 'Ürün Tipi Silme', code: 'ITEM_TYPES_DELETE', group: 'ITEM_TYPES', description: 'Ürün tipi silme izni' },

  // İzin İzinleri
  { name: 'İzinleri Görüntüleme', code: 'PERMISSIONS_VIEW', group: 'PERMISSIONS', description: 'İzinleri görüntüleme izni' },
  { name: 'İzin Oluşturma', code: 'PERMISSIONS_CREATE', group: 'PERMISSIONS', description: 'Yeni izin oluşturma izni' },
  { name: 'İzin Güncelleme', code: 'PERMISSIONS_UPDATE', group: 'PERMISSIONS', description: 'Mevcut izinleri güncelleme izni' },
  { name: 'İzin Silme', code: 'PERMISSIONS_DELETE', group: 'PERMISSIONS', description: 'İzin silme izni' },

  // İzin Grubu İzinleri
  { name: 'İzin Gruplarını Görüntüleme', code: 'PERMISSION_GROUPS_VIEW', group: 'PERMISSION_GROUPS', description: 'İzin gruplarını görüntüleme izni' },
  { name: 'İzin Grubu Oluşturma', code: 'PERMISSION_GROUPS_CREATE', group: 'PERMISSION_GROUPS', description: 'Yeni izin grubu oluşturma izni' },
  { name: 'İzin Grubu Güncelleme', code: 'PERMISSION_GROUPS_UPDATE', group: 'PERMISSION_GROUPS', description: 'Mevcut izin gruplarını güncelleme izni' },
  { name: 'İzin Grubu Silme', code: 'PERMISSION_GROUPS_DELETE', group: 'PERMISSION_GROUPS', description: 'İzin grubu silme izni' },

  // İlişki İzinleri
  { name: 'İlişkileri Görüntüleme', code: 'RELATIONSHIPS_VIEW', group: 'RELATIONSHIPS', description: 'İlişkileri görüntüleme izni' },
  { name: 'İlişki Oluşturma', code: 'RELATIONSHIPS_CREATE', group: 'RELATIONSHIPS', description: 'Yeni ilişki oluşturma izni' },
  { name: 'İlişki Güncelleme', code: 'RELATIONSHIPS_UPDATE', group: 'RELATIONSHIPS', description: 'Mevcut ilişkileri güncelleme izni' },
  { name: 'İlişki Silme', code: 'RELATIONSHIPS_DELETE', group: 'RELATIONSHIPS', description: 'İlişki silme izni' },

  // İlişki Tipi İzinleri
  { name: 'İlişki Tiplerini Görüntüleme', code: 'RELATIONSHIP_TYPES_VIEW', group: 'RELATIONSHIP_TYPES', description: 'İlişki tiplerini görüntüleme izni' },
  { name: 'İlişki Tipi Oluşturma', code: 'RELATIONSHIP_TYPES_CREATE', group: 'RELATIONSHIP_TYPES', description: 'Yeni ilişki tipi oluşturma izni' },
  { name: 'İlişki Tipi Güncelleme', code: 'RELATIONSHIP_TYPES_UPDATE', group: 'RELATIONSHIP_TYPES', description: 'Mevcut ilişki tiplerini güncelleme izni' },
  { name: 'İlişki Tipi Silme', code: 'RELATIONSHIP_TYPES_DELETE', group: 'RELATIONSHIP_TYPES', description: 'İlişki tipi silme izni' },

  // Çeviri İzinleri
  { name: 'Çevirileri Görüntüleme', code: 'TRANSLATIONS_VIEW', group: 'TRANSLATIONS', description: 'Çevirileri görüntüleme izni' },
  { name: 'Çevirileri Yönetme', code: 'TRANSLATIONS_MANAGE', group: 'TRANSLATIONS', description: 'Çevirileri yönetme izni' },

  // Kullanıcı İzinleri
  { name: 'Kullanıcıları Görüntüleme', code: 'USERS_VIEW', group: 'USERS', description: 'Kullanıcıları görüntüleme izni' },
  { name: 'Kullanıcı Oluşturma', code: 'USERS_CREATE', group: 'USERS', description: 'Yeni kullanıcı oluşturma izni' },
  { name: 'Kullanıcı Güncelleme', code: 'USERS_UPDATE', group: 'USERS', description: 'Mevcut kullanıcıları güncelleme izni' },
  { name: 'Kullanıcı Silme', code: 'USERS_DELETE', group: 'USERS', description: 'Kullanıcı silme izni' },

  // Rol İzinleri
  { name: 'Rolleri Görüntüleme', code: 'ROLES_VIEW', group: 'ROLES', description: 'Rolleri görüntüleme izni' },
  { name: 'Rol Oluşturma', code: 'ROLES_CREATE', group: 'ROLES', description: 'Yeni rol oluşturma izni' },
  { name: 'Rol Güncelleme', code: 'ROLES_UPDATE', group: 'ROLES', description: 'Mevcut rolleri güncelleme izni' },
  { name: 'Rol Silme', code: 'ROLES_DELETE', group: 'ROLES', description: 'Rol silme izni' }
];

// Roller
const roles = [
  {
    name: 'System Admin',
    code: 'SYSTEM_ADMIN',
    description: 'Sistem yöneticisi rolü. Tüm yetkilere sahiptir.'
  },
  {
    name: 'Ürün Yöneticisi',
    code: 'PRODUCT_MANAGER',
    description: 'Ürün yönetimi ile ilgili yetkilere sahiptir.',
    permissions: [
      'ITEMS_VIEW', 'ITEMS_CREATE', 'ITEMS_UPDATE', 'ITEMS_DELETE',
      'ITEM_TYPES_VIEW', 'ITEM_TYPES_CREATE', 'ITEM_TYPES_UPDATE', 'ITEM_TYPES_DELETE',
      'ATTRIBUTES_VIEW', 'ATTRIBUTES_CREATE', 'ATTRIBUTES_UPDATE', 'ATTRIBUTES_DELETE',
      'ATTRIBUTE_GROUPS_VIEW', 'ATTRIBUTE_GROUPS_CREATE', 'ATTRIBUTE_GROUPS_UPDATE', 'ATTRIBUTE_GROUPS_DELETE',
      'CATEGORIES_VIEW', 'CATEGORIES_CREATE', 'CATEGORIES_UPDATE', 'CATEGORIES_DELETE',
      'FAMILIES_VIEW', 'FAMILIES_CREATE', 'FAMILIES_UPDATE', 'FAMILIES_DELETE'
    ]
  },
  {
    name: 'İçerik Yöneticisi',
    code: 'CONTENT_MANAGER',
    description: 'İçerik yönetimi ile ilgili yetkilere sahiptir.',
    permissions: [
      'TRANSLATIONS_VIEW', 'TRANSLATIONS_MANAGE',
      'RELATIONSHIPS_VIEW', 'RELATIONSHIPS_CREATE', 'RELATIONSHIPS_UPDATE', 'RELATIONSHIPS_DELETE',
      'RELATIONSHIP_TYPES_VIEW', 'RELATIONSHIP_TYPES_CREATE', 'RELATIONSHIP_TYPES_UPDATE', 'RELATIONSHIP_TYPES_DELETE'
    ]
  }
];

async function setupDatabase() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect('mongodb://localhost:27017/spesengine');

    // Mevcut verileri temizle
    await Permission.deleteMany({});
    await PermissionGroup.deleteMany({});
    await Role.deleteMany({});

    // İzin gruplarını ekle
    const createdGroups = await PermissionGroup.create(
      permissionGroups.map(group => ({
        name: group.name,
        code: group.code,
        isActive: true,
        description: group.description
      }))
    );

    // İzinleri ekle
    const createdPermissions = await Permission.create(
      permissions.map(perm => ({
        name: perm.name,
        code: perm.code,
        description: perm.description,
        permissionGroup: createdGroups.find(g => g.code === perm.group)?._id,
        isActive: true
      }))
    );

    // Rolleri ekle
    for (const role of roles) {
      let rolePermissions = [];
      if (role.code === 'SYSTEM_ADMIN') {
        // System Admin için tüm izinleri ekle
        rolePermissions = createdPermissions.map(p => p._id);
      } else {
        // Diğer roller için belirtilen izinleri ekle
        rolePermissions = createdPermissions
          .filter(p => role.permissions?.includes(p.code))
          .map(p => p._id);
      }

      await Role.create({
        name: role.name,
        code: role.code,
        description: role.description,
        permissions: rolePermissions,
        isActive: true
      });
    }

    console.log('Veritabanı başarıyla güncellendi!');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

setupDatabase(); 