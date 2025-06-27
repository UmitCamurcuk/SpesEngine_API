import mongoose from 'mongoose';
import Permission from '../models/Permission';
import PermissionGroup from '../models/PermissionGroup';
import Role from '../models/Role';
import User from '../models/User';

// Veritabanını temizle ve yeni yapıya göre seed et
async function setupDatabase() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect('mongodb://localhost:27017/spesengine');
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut verileri temizle
    console.log('Mevcut veriler temizleniyor...');
    await User.updateMany({}, { $unset: { role: "" } }); // User'lardan role referanslarını kaldır
    await Role.deleteMany({});
    await PermissionGroup.deleteMany({});
    await Permission.deleteMany({});
    console.log('Mevcut veriler temizlendi');

    // 1. İzinleri oluştur (yeni translate yapısıyla)
    console.log('İzinler oluşturuluyor...');
    const permissions = [
      // Öznitelik İzinleri
      { code: 'ATTRIBUTES_VIEW', name: { tr: 'Öznitelik Görüntüleme', en: 'View Attributes' }, description: { tr: 'Öznitelikleri görüntüleme izni', en: 'Permission to view attributes' } },
      { code: 'ATTRIBUTES_CREATE', name: { tr: 'Öznitelik Oluşturma', en: 'Create Attributes' }, description: { tr: 'Yeni öznitelik oluşturma izni', en: 'Permission to create new attributes' } },
      { code: 'ATTRIBUTES_UPDATE', name: { tr: 'Öznitelik Güncelleme', en: 'Update Attributes' }, description: { tr: 'Mevcut öznitelikleri güncelleme izni', en: 'Permission to update existing attributes' } },
      { code: 'ATTRIBUTES_DELETE', name: { tr: 'Öznitelik Silme', en: 'Delete Attributes' }, description: { tr: 'Öznitelik silme izni', en: 'Permission to delete attributes' } },

      // Öznitelik Grubu İzinleri
      { code: 'ATTRIBUTE_GROUPS_VIEW', name: { tr: 'Öznitelik Grubu Görüntüleme', en: 'View Attribute Groups' }, description: { tr: 'Öznitelik gruplarını görüntüleme izni', en: 'Permission to view attribute groups' } },
      { code: 'ATTRIBUTE_GROUPS_CREATE', name: { tr: 'Öznitelik Grubu Oluşturma', en: 'Create Attribute Groups' }, description: { tr: 'Yeni öznitelik grubu oluşturma izni', en: 'Permission to create new attribute groups' } },
      { code: 'ATTRIBUTE_GROUPS_UPDATE', name: { tr: 'Öznitelik Grubu Güncelleme', en: 'Update Attribute Groups' }, description: { tr: 'Mevcut öznitelik gruplarını güncelleme izni', en: 'Permission to update existing attribute groups' } },
      { code: 'ATTRIBUTE_GROUPS_DELETE', name: { tr: 'Öznitelik Grubu Silme', en: 'Delete Attribute Groups' }, description: { tr: 'Öznitelik grubu silme izni', en: 'Permission to delete attribute groups' } },

      // Kategori İzinleri
      { code: 'CATEGORIES_VIEW', name: { tr: 'Kategori Görüntüleme', en: 'View Categories' }, description: { tr: 'Kategorileri görüntüleme izni', en: 'Permission to view categories' } },
      { code: 'CATEGORIES_CREATE', name: { tr: 'Kategori Oluşturma', en: 'Create Categories' }, description: { tr: 'Yeni kategori oluşturma izni', en: 'Permission to create new categories' } },
      { code: 'CATEGORIES_UPDATE', name: { tr: 'Kategori Güncelleme', en: 'Update Categories' }, description: { tr: 'Mevcut kategorileri güncelleme izni', en: 'Permission to update existing categories' } },
      { code: 'CATEGORIES_DELETE', name: { tr: 'Kategori Silme', en: 'Delete Categories' }, description: { tr: 'Kategori silme izni', en: 'Permission to delete categories' } },

      // Aile İzinleri
      { code: 'FAMILIES_VIEW', name: { tr: 'Aile Görüntüleme', en: 'View Families' }, description: { tr: 'Aileleri görüntüleme izni', en: 'Permission to view families' } },
      { code: 'FAMILIES_CREATE', name: { tr: 'Aile Oluşturma', en: 'Create Families' }, description: { tr: 'Yeni aile oluşturma izni', en: 'Permission to create new families' } },
      { code: 'FAMILIES_UPDATE', name: { tr: 'Aile Güncelleme', en: 'Update Families' }, description: { tr: 'Mevcut aileleri güncelleme izni', en: 'Permission to update existing families' } },
      { code: 'FAMILIES_DELETE', name: { tr: 'Aile Silme', en: 'Delete Families' }, description: { tr: 'Aile silme izni', en: 'Permission to delete families' } },

      // Geçmiş İzinleri
      { code: 'HISTORY_VIEW', name: { tr: 'Geçmiş Görüntüleme', en: 'View History' }, description: { tr: 'Sistem geçmişini görüntüleme izni', en: 'Permission to view system history' } },

      // Ürün İzinleri
      { code: 'ITEMS_VIEW', name: { tr: 'Ürün Görüntüleme', en: 'View Items' }, description: { tr: 'Ürünleri görüntüleme izni', en: 'Permission to view items' } },
      { code: 'ITEMS_CREATE', name: { tr: 'Ürün Oluşturma', en: 'Create Items' }, description: { tr: 'Yeni ürün oluşturma izni', en: 'Permission to create new items' } },
      { code: 'ITEMS_UPDATE', name: { tr: 'Ürün Güncelleme', en: 'Update Items' }, description: { tr: 'Mevcut ürünleri güncelleme izni', en: 'Permission to update existing items' } },
      { code: 'ITEMS_DELETE', name: { tr: 'Ürün Silme', en: 'Delete Items' }, description: { tr: 'Ürün silme izni', en: 'Permission to delete items' } },

      // Ürün Tipi İzinleri
      { code: 'ITEM_TYPES_VIEW', name: { tr: 'Ürün Tipi Görüntüleme', en: 'View Item Types' }, description: { tr: 'Ürün tiplerini görüntüleme izni', en: 'Permission to view item types' } },
      { code: 'ITEM_TYPES_CREATE', name: { tr: 'Ürün Tipi Oluşturma', en: 'Create Item Types' }, description: { tr: 'Yeni ürün tipi oluşturma izni', en: 'Permission to create new item types' } },
      { code: 'ITEM_TYPES_UPDATE', name: { tr: 'Ürün Tipi Güncelleme', en: 'Update Item Types' }, description: { tr: 'Mevcut ürün tiplerini güncelleme izni', en: 'Permission to update existing item types' } },
      { code: 'ITEM_TYPES_DELETE', name: { tr: 'Ürün Tipi Silme', en: 'Delete Item Types' }, description: { tr: 'Ürün tipi silme izni', en: 'Permission to delete item types' } },

      // İzin İzinleri
      { code: 'PERMISSIONS_VIEW', name: { tr: 'İzin Görüntüleme', en: 'View Permissions' }, description: { tr: 'İzinleri görüntüleme izni', en: 'Permission to view permissions' } },
      { code: 'PERMISSIONS_CREATE', name: { tr: 'İzin Oluşturma', en: 'Create Permissions' }, description: { tr: 'Yeni izin oluşturma izni', en: 'Permission to create new permissions' } },
      { code: 'PERMISSIONS_UPDATE', name: { tr: 'İzin Güncelleme', en: 'Update Permissions' }, description: { tr: 'Mevcut izinleri güncelleme izni', en: 'Permission to update existing permissions' } },
      { code: 'PERMISSIONS_DELETE', name: { tr: 'İzin Silme', en: 'Delete Permissions' }, description: { tr: 'İzin silme izni', en: 'Permission to delete permissions' } },

      // İzin Grubu İzinleri
      { code: 'PERMISSION_GROUPS_VIEW', name: { tr: 'İzin Grubu Görüntüleme', en: 'View Permission Groups' }, description: { tr: 'İzin gruplarını görüntüleme izni', en: 'Permission to view permission groups' } },
      { code: 'PERMISSION_GROUPS_CREATE', name: { tr: 'İzin Grubu Oluşturma', en: 'Create Permission Groups' }, description: { tr: 'Yeni izin grubu oluşturma izni', en: 'Permission to create new permission groups' } },
      { code: 'PERMISSION_GROUPS_UPDATE', name: { tr: 'İzin Grubu Güncelleme', en: 'Update Permission Groups' }, description: { tr: 'Mevcut izin gruplarını güncelleme izni', en: 'Permission to update existing permission groups' } },
      { code: 'PERMISSION_GROUPS_DELETE', name: { tr: 'İzin Grubu Silme', en: 'Delete Permission Groups' }, description: { tr: 'İzin grubu silme izni', en: 'Permission to delete permission groups' } },

      // İlişki İzinleri
      { code: 'RELATIONSHIPS_VIEW', name: { tr: 'İlişki Görüntüleme', en: 'View Relationships' }, description: { tr: 'İlişkileri görüntüleme izni', en: 'Permission to view relationships' } },
      { code: 'RELATIONSHIPS_CREATE', name: { tr: 'İlişki Oluşturma', en: 'Create Relationships' }, description: { tr: 'Yeni ilişki oluşturma izni', en: 'Permission to create new relationships' } },
      { code: 'RELATIONSHIPS_UPDATE', name: { tr: 'İlişki Güncelleme', en: 'Update Relationships' }, description: { tr: 'Mevcut ilişkileri güncelleme izni', en: 'Permission to update existing relationships' } },
      { code: 'RELATIONSHIPS_DELETE', name: { tr: 'İlişki Silme', en: 'Delete Relationships' }, description: { tr: 'İlişki silme izni', en: 'Permission to delete relationships' } },

      // İlişki Tipi İzinleri
      { code: 'RELATIONSHIP_TYPES_VIEW', name: { tr: 'İlişki Tipi Görüntüleme', en: 'View Relationship Types' }, description: { tr: 'İlişki tiplerini görüntüleme izni', en: 'Permission to view relationship types' } },
      { code: 'RELATIONSHIP_TYPES_CREATE', name: { tr: 'İlişki Tipi Oluşturma', en: 'Create Relationship Types' }, description: { tr: 'Yeni ilişki tipi oluşturma izni', en: 'Permission to create new relationship types' } },
      { code: 'RELATIONSHIP_TYPES_UPDATE', name: { tr: 'İlişki Tipi Güncelleme', en: 'Update Relationship Types' }, description: { tr: 'Mevcut ilişki tiplerini güncelleme izni', en: 'Permission to update existing relationship types' } },
      { code: 'RELATIONSHIP_TYPES_DELETE', name: { tr: 'İlişki Tipi Silme', en: 'Delete Relationship Types' }, description: { tr: 'İlişki tipi silme izni', en: 'Permission to delete relationship types' } },

      // Çeviri İzinleri
      { code: 'TRANSLATIONS_VIEW', name: { tr: 'Çeviri Görüntüleme', en: 'View Translations' }, description: { tr: 'Çevirileri görüntüleme izni', en: 'Permission to view translations' } },
      { code: 'TRANSLATIONS_MANAGE', name: { tr: 'Çeviri Yönetimi', en: 'Manage Translations' }, description: { tr: 'Çevirileri yönetme izni', en: 'Permission to manage translations' } },

      // Kullanıcı İzinleri
      { code: 'USERS_VIEW', name: { tr: 'Kullanıcı Görüntüleme', en: 'View Users' }, description: { tr: 'Kullanıcıları görüntüleme izni', en: 'Permission to view users' } },
      { code: 'USERS_CREATE', name: { tr: 'Kullanıcı Oluşturma', en: 'Create Users' }, description: { tr: 'Yeni kullanıcı oluşturma izni', en: 'Permission to create new users' } },
      { code: 'USERS_UPDATE', name: { tr: 'Kullanıcı Güncelleme', en: 'Update Users' }, description: { tr: 'Mevcut kullanıcıları güncelleme izni', en: 'Permission to update existing users' } },
      { code: 'USERS_DELETE', name: { tr: 'Kullanıcı Silme', en: 'Delete Users' }, description: { tr: 'Kullanıcı silme izni', en: 'Permission to delete users' } },

      // Rol İzinleri
      { code: 'ROLES_VIEW', name: { tr: 'Rol Görüntüleme', en: 'View Roles' }, description: { tr: 'Rolleri görüntüleme izni', en: 'Permission to view roles' } },
      { code: 'ROLES_CREATE', name: { tr: 'Rol Oluşturma', en: 'Create Roles' }, description: { tr: 'Yeni rol oluşturma izni', en: 'Permission to create new roles' } },
      { code: 'ROLES_UPDATE', name: { tr: 'Rol Güncelleme', en: 'Update Roles' }, description: { tr: 'Mevcut rolleri güncelleme izni', en: 'Permission to update existing roles' } },
      { code: 'ROLES_DELETE', name: { tr: 'Rol Silme', en: 'Delete Roles' }, description: { tr: 'Rol silme izni', en: 'Permission to delete roles' } },

      // Sistem Ayarları İzinleri
      { code: 'SETTINGS_VIEW', name: { tr: 'Ayar Görüntüleme', en: 'View Settings' }, description: { tr: 'Sistem ayarlarını görüntüleme izni', en: 'Permission to view system settings' } },
      { code: 'SETTINGS_UPDATE', name: { tr: 'Ayar Güncelleme', en: 'Update Settings' }, description: { tr: 'Sistem ayarlarını güncelleme izni', en: 'Permission to update system settings' } },
      { code: 'SETTINGS_MANAGE', name: { tr: 'Ayar Yönetimi', en: 'Manage Settings' }, description: { tr: 'Sistem ayarlarını tam yönetme izni', en: 'Full permission to manage system settings' } },
      { code: 'SYSTEM_ADMIN', name: { tr: 'Sistem Yönetimi', en: 'System Administration' }, description: { tr: 'Tam sistem yönetimi izni', en: 'Full system administration permission' } }
    ];

    const createdPermissions = await Permission.create(permissions);
    console.log(`${createdPermissions.length} izin oluşturuldu`);

    // 2. İzin gruplarını oluştur ve permission'ları ata
    console.log('İzin grupları oluşturuluyor...');
    const permissionGroups = [
      {
        name: 'Öznitelik Yönetimi',
        code: 'ATTRIBUTES',
        description: 'Ürün özniteliklerinin yönetimi için izinler',
        permissionCodes: ['ATTRIBUTES_VIEW', 'ATTRIBUTES_CREATE', 'ATTRIBUTES_UPDATE', 'ATTRIBUTES_DELETE']
      },
      {
        name: 'Öznitelik Grubu Yönetimi',
        code: 'ATTRIBUTE_GROUPS',
        description: 'Öznitelik gruplarının yönetimi için izinler',
        permissionCodes: ['ATTRIBUTE_GROUPS_VIEW', 'ATTRIBUTE_GROUPS_CREATE', 'ATTRIBUTE_GROUPS_UPDATE', 'ATTRIBUTE_GROUPS_DELETE']
      },
      {
        name: 'Kategori Yönetimi',
        code: 'CATEGORIES',
        description: 'Ürün kategorilerinin yönetimi için izinler',
        permissionCodes: ['CATEGORIES_VIEW', 'CATEGORIES_CREATE', 'CATEGORIES_UPDATE', 'CATEGORIES_DELETE']
      },
      {
        name: 'Aile Yönetimi',
        code: 'FAMILIES',
        description: 'Ürün ailelerinin yönetimi için izinler',
        permissionCodes: ['FAMILIES_VIEW', 'FAMILIES_CREATE', 'FAMILIES_UPDATE', 'FAMILIES_DELETE']
      },
      {
        name: 'Geçmiş Yönetimi',
        code: 'HISTORY',
        description: 'Sistem geçmişinin görüntülenmesi için izinler',
        permissionCodes: ['HISTORY_VIEW']
      },
      {
        name: 'Ürün Yönetimi',
        code: 'ITEMS',
        description: 'Ürünlerin yönetimi için izinler',
        permissionCodes: ['ITEMS_VIEW', 'ITEMS_CREATE', 'ITEMS_UPDATE', 'ITEMS_DELETE']
      },
      {
        name: 'Ürün Tipi Yönetimi',
        code: 'ITEM_TYPES',
        description: 'Ürün tiplerinin yönetimi için izinler',
        permissionCodes: ['ITEM_TYPES_VIEW', 'ITEM_TYPES_CREATE', 'ITEM_TYPES_UPDATE', 'ITEM_TYPES_DELETE']
      },
      {
        name: 'İzin Yönetimi',
        code: 'PERMISSIONS',
        description: 'Sistem izinlerinin yönetimi için izinler',
        permissionCodes: ['PERMISSIONS_VIEW', 'PERMISSIONS_CREATE', 'PERMISSIONS_UPDATE', 'PERMISSIONS_DELETE']
      },
      {
        name: 'İzin Grubu Yönetimi',
        code: 'PERMISSION_GROUPS',
        description: 'İzin gruplarının yönetimi için izinler',
        permissionCodes: ['PERMISSION_GROUPS_VIEW', 'PERMISSION_GROUPS_CREATE', 'PERMISSION_GROUPS_UPDATE', 'PERMISSION_GROUPS_DELETE']
      },
      {
        name: 'İlişki Yönetimi',
        code: 'RELATIONSHIPS',
        description: 'Ürün ilişkilerinin yönetimi için izinler',
        permissionCodes: ['RELATIONSHIPS_VIEW', 'RELATIONSHIPS_CREATE', 'RELATIONSHIPS_UPDATE', 'RELATIONSHIPS_DELETE']
      },
      {
        name: 'İlişki Tipi Yönetimi',
        code: 'RELATIONSHIP_TYPES',
        description: 'İlişki tiplerinin yönetimi için izinler',
        permissionCodes: ['RELATIONSHIP_TYPES_VIEW', 'RELATIONSHIP_TYPES_CREATE', 'RELATIONSHIP_TYPES_UPDATE', 'RELATIONSHIP_TYPES_DELETE']
      },
      {
        name: 'Çeviri Yönetimi',
        code: 'TRANSLATIONS',
        description: 'Sistem çevirilerinin yönetimi için izinler',
        permissionCodes: ['TRANSLATIONS_VIEW', 'TRANSLATIONS_MANAGE']
      },
      {
        name: 'Kullanıcı Yönetimi',
        code: 'USERS',
        description: 'Kullanıcıların yönetimi için izinler',
        permissionCodes: ['USERS_VIEW', 'USERS_CREATE', 'USERS_UPDATE', 'USERS_DELETE']
      },
      {
        name: 'Rol Yönetimi',
        code: 'ROLES',
        description: 'Kullanıcı rollerinin yönetimi için izinler',
        permissionCodes: ['ROLES_VIEW', 'ROLES_CREATE', 'ROLES_UPDATE', 'ROLES_DELETE']
      },
      {
        name: 'Sistem Ayarları',
        code: 'SYSTEM',
        description: 'Sistem ayarları yönetimi için izinler',
        permissionCodes: ['SETTINGS_VIEW', 'SETTINGS_UPDATE', 'SETTINGS_MANAGE', 'SYSTEM_ADMIN']
      }
    ];

    const createdGroups = [];
    for (const group of permissionGroups) {
      // Permission ID'lerini bul
      const groupPermissions = createdPermissions.filter(p => 
        group.permissionCodes.includes(p.code)
      ).map(p => p._id);

      const createdGroup = await PermissionGroup.create({
        name: group.name,
        code: group.code,
        description: group.description,
        permissions: groupPermissions
      });

      createdGroups.push(createdGroup);
    }
    console.log(`${createdGroups.length} izin grubu oluşturuldu`);

    // 3. Rolleri oluştur
    console.log('Roller oluşturuluyor...');
    
    // System Admin rolü - tüm permission grupları ve tüm permissions granted
    const systemAdminPermissionGroups = createdGroups.map(group => ({
      permissionGroup: group._id,
      permissions: group.permissions.map(permissionId => ({
        permission: permissionId,
        granted: true
      }))
    }));

    const systemAdminRole = await Role.create({
      name: 'System Admin',
      description: 'Sistem yöneticisi rolü. Tüm yetkilere sahiptir.',
      permissionGroups: systemAdminPermissionGroups
    });

    // Ürün Yöneticisi rolü
    const productManagerGroups = ['ATTRIBUTES', 'ATTRIBUTE_GROUPS', 'CATEGORIES', 'FAMILIES', 'ITEMS', 'ITEM_TYPES'];
    const productManagerPermissionGroups = createdGroups
      .filter(group => productManagerGroups.includes(group.code))
      .map(group => ({
        permissionGroup: group._id,
        permissions: group.permissions.map(permissionId => ({
          permission: permissionId,
          granted: true
        }))
      }));

    const productManagerRole = await Role.create({
      name: 'Ürün Yöneticisi',
      description: 'Ürün yönetimi ile ilgili yetkilere sahiptir.',
      permissionGroups: productManagerPermissionGroups
    });

    // İçerik Yöneticisi rolü
    const contentManagerGroups = ['TRANSLATIONS', 'RELATIONSHIPS', 'RELATIONSHIP_TYPES'];
    const contentManagerPermissionGroups = createdGroups
      .filter(group => contentManagerGroups.includes(group.code))
      .map(group => ({
        permissionGroup: group._id,
        permissions: group.permissions.map(permissionId => ({
          permission: permissionId,
          granted: true
        }))
      }));

    const contentManagerRole = await Role.create({
      name: 'İçerik Yöneticisi',
      description: 'İçerik yönetimi ile ilgili yetkilere sahiptir.',
      permissionGroups: contentManagerPermissionGroups
    });

    console.log('3 rol oluşturuldu');
    console.log('- System Admin (Tüm yetkiler)');
    console.log('- Ürün Yöneticisi (Ürün yönetimi yetkileri)');
    console.log('- İçerik Yöneticisi (İçerik yönetimi yetkileri)');

    console.log('\n=== Kurulum Tamamlandı ===');
    console.log('Yeni yapı başarıyla oluşturuldu!');
    console.log('- Permission modeli: name/description artık translate object (tr/en)');
    console.log('- PermissionGroup modeli: permissions array içeriyor');
    console.log('- Role modeli: permissionGroups ve granular permission control');

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

setupDatabase(); 