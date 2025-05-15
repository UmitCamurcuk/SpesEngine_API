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
const PermissionGroup_1 = __importDefault(require("../models/PermissionGroup"));
const Permission_1 = __importDefault(require("../models/Permission"));
const Role_1 = __importDefault(require("../models/Role"));
const User_1 = __importDefault(require("../models/User"));
// Env değişkenlerini yükle
dotenv_1.default.config();
// MongoDB bağlantısı
(0, database_1.default)();
// İzin grupları tanımları
const permissionGroups = [
    {
        name: 'Öznitelik Yönetimi',
        code: 'ATTRIBUTE_MANAGEMENT',
        description: 'Öznitelikler ve öznitelik grupları ile ilgili izinler'
    },
    {
        name: 'Kategori Yönetimi',
        code: 'CATEGORY_MANAGEMENT',
        description: 'Kategoriler ile ilgili izinler'
    },
    {
        name: 'Aile Yönetimi',
        code: 'FAMILY_MANAGEMENT',
        description: 'Ürün aileleri ile ilgili izinler'
    },
    {
        name: 'Öğe Tipi Yönetimi',
        code: 'ITEM_TYPE_MANAGEMENT',
        description: 'Öğe tipleri ile ilgili izinler'
    },
    {
        name: 'Öğe Yönetimi',
        code: 'ITEM_MANAGEMENT',
        description: 'Öğeler ile ilgili izinler'
    },
    {
        name: 'Rol Yönetimi',
        code: 'ROLE_MANAGEMENT',
        description: 'Roller ile ilgili izinler'
    },
    {
        name: 'İzin Yönetimi',
        code: 'PERMISSION_MANAGEMENT',
        description: 'İzinler ve izin grupları ile ilgili izinler'
    },
    {
        name: 'Kullanıcı Yönetimi',
        code: 'USER_MANAGEMENT',
        description: 'Kullanıcılar ile ilgili izinler'
    },
    {
        name: 'Sistem Yönetimi',
        code: 'SYSTEM_MANAGEMENT',
        description: 'Sistem ayarları ile ilgili izinler'
    }
];
const permissionDefinitions = [
    // Öznitelik izinleri
    {
        name: 'Öznitelikleri Görüntüleme',
        code: 'attributes:read',
        description: 'Öznitelikleri görüntüleme izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    {
        name: 'Öznitelik Oluşturma',
        code: 'attributes:create',
        description: 'Yeni öznitelik oluşturma izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    {
        name: 'Öznitelik Güncelleme',
        code: 'attributes:update',
        description: 'Mevcut öznitelikleri güncelleme izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    {
        name: 'Öznitelik Silme',
        code: 'attributes:delete',
        description: 'Öznitelikleri silme izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    // Öznitelik grupları izinleri
    {
        name: 'Öznitelik Gruplarını Görüntüleme',
        code: 'attributeGroups:read',
        description: 'Öznitelik gruplarını görüntüleme izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    {
        name: 'Öznitelik Grubu Oluşturma',
        code: 'attributeGroups:create',
        description: 'Yeni öznitelik grubu oluşturma izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    {
        name: 'Öznitelik Grubu Güncelleme',
        code: 'attributeGroups:update',
        description: 'Mevcut öznitelik gruplarını güncelleme izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    {
        name: 'Öznitelik Grubu Silme',
        code: 'attributeGroups:delete',
        description: 'Öznitelik gruplarını silme izni',
        groupCode: 'ATTRIBUTE_MANAGEMENT'
    },
    // Kategori izinleri
    {
        name: 'Kategorileri Görüntüleme',
        code: 'categories:read',
        description: 'Kategorileri görüntüleme izni',
        groupCode: 'CATEGORY_MANAGEMENT'
    },
    {
        name: 'Kategori Oluşturma',
        code: 'categories:create',
        description: 'Yeni kategori oluşturma izni',
        groupCode: 'CATEGORY_MANAGEMENT'
    },
    {
        name: 'Kategori Güncelleme',
        code: 'categories:update',
        description: 'Mevcut kategorileri güncelleme izni',
        groupCode: 'CATEGORY_MANAGEMENT'
    },
    {
        name: 'Kategori Silme',
        code: 'categories:delete',
        description: 'Kategorileri silme izni',
        groupCode: 'CATEGORY_MANAGEMENT'
    },
    // Aile izinleri
    {
        name: 'Aileleri Görüntüleme',
        code: 'families:read',
        description: 'Aileleri görüntüleme izni',
        groupCode: 'FAMILY_MANAGEMENT'
    },
    {
        name: 'Aile Oluşturma',
        code: 'families:create',
        description: 'Yeni aile oluşturma izni',
        groupCode: 'FAMILY_MANAGEMENT'
    },
    {
        name: 'Aile Güncelleme',
        code: 'families:update',
        description: 'Mevcut aileleri güncelleme izni',
        groupCode: 'FAMILY_MANAGEMENT'
    },
    {
        name: 'Aile Silme',
        code: 'families:delete',
        description: 'Aileleri silme izni',
        groupCode: 'FAMILY_MANAGEMENT'
    },
    // Öğe tipi izinleri
    {
        name: 'Öğe Tiplerini Görüntüleme',
        code: 'itemTypes:read',
        description: 'Öğe tiplerini görüntüleme izni',
        groupCode: 'ITEM_TYPE_MANAGEMENT'
    },
    {
        name: 'Öğe Tipi Oluşturma',
        code: 'itemTypes:create',
        description: 'Yeni öğe tipi oluşturma izni',
        groupCode: 'ITEM_TYPE_MANAGEMENT'
    },
    {
        name: 'Öğe Tipi Güncelleme',
        code: 'itemTypes:update',
        description: 'Mevcut öğe tiplerini güncelleme izni',
        groupCode: 'ITEM_TYPE_MANAGEMENT'
    },
    {
        name: 'Öğe Tipi Silme',
        code: 'itemTypes:delete',
        description: 'Öğe tiplerini silme izni',
        groupCode: 'ITEM_TYPE_MANAGEMENT'
    },
    // Öğe izinleri
    {
        name: 'Öğeleri Görüntüleme',
        code: 'items:read',
        description: 'Öğeleri görüntüleme izni',
        groupCode: 'ITEM_MANAGEMENT'
    },
    {
        name: 'Öğe Oluşturma',
        code: 'items:create',
        description: 'Yeni öğe oluşturma izni',
        groupCode: 'ITEM_MANAGEMENT'
    },
    {
        name: 'Öğe Güncelleme',
        code: 'items:update',
        description: 'Mevcut öğeleri güncelleme izni',
        groupCode: 'ITEM_MANAGEMENT'
    },
    {
        name: 'Öğe Silme',
        code: 'items:delete',
        description: 'Öğeleri silme izni',
        groupCode: 'ITEM_MANAGEMENT'
    },
    // Rol izinleri
    {
        name: 'Rolleri Görüntüleme',
        code: 'roles:read',
        description: 'Rolleri görüntüleme izni',
        groupCode: 'ROLE_MANAGEMENT'
    },
    {
        name: 'Rol Oluşturma',
        code: 'roles:create',
        description: 'Yeni rol oluşturma izni',
        groupCode: 'ROLE_MANAGEMENT'
    },
    {
        name: 'Rol Güncelleme',
        code: 'roles:update',
        description: 'Mevcut rolleri güncelleme izni',
        groupCode: 'ROLE_MANAGEMENT'
    },
    {
        name: 'Rol Silme',
        code: 'roles:delete',
        description: 'Rolleri silme izni',
        groupCode: 'ROLE_MANAGEMENT'
    },
    // İzin izinleri
    {
        name: 'İzinleri Görüntüleme',
        code: 'permissions:read',
        description: 'İzinleri görüntüleme izni',
        groupCode: 'PERMISSION_MANAGEMENT'
    },
    {
        name: 'İzin Oluşturma',
        code: 'permissions:create',
        description: 'Yeni izin oluşturma izni',
        groupCode: 'PERMISSION_MANAGEMENT'
    },
    {
        name: 'İzin Güncelleme',
        code: 'permissions:update',
        description: 'Mevcut izinleri güncelleme izni',
        groupCode: 'PERMISSION_MANAGEMENT'
    },
    {
        name: 'İzin Silme',
        code: 'permissions:delete',
        description: 'İzinleri silme izni',
        groupCode: 'PERMISSION_MANAGEMENT'
    },
    // Kullanıcı izinleri
    {
        name: 'Kullanıcıları Görüntüleme',
        code: 'users:read',
        description: 'Kullanıcıları görüntüleme izni',
        groupCode: 'USER_MANAGEMENT'
    },
    {
        name: 'Kullanıcı Oluşturma',
        code: 'users:create',
        description: 'Yeni kullanıcı oluşturma izni',
        groupCode: 'USER_MANAGEMENT'
    },
    {
        name: 'Kullanıcı Güncelleme',
        code: 'users:update',
        description: 'Mevcut kullanıcıları güncelleme izni',
        groupCode: 'USER_MANAGEMENT'
    },
    {
        name: 'Kullanıcı Silme',
        code: 'users:delete',
        description: 'Kullanıcıları silme izni',
        groupCode: 'USER_MANAGEMENT'
    }
];
// Veritabanına izin grupları, izinler ve rolleri ekle
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Önce tüm mevcut verileri temizle
        yield PermissionGroup_1.default.deleteMany({});
        yield Permission_1.default.deleteMany({});
        yield Role_1.default.deleteMany({});
        console.log('Mevcut veriler temizlendi');
        // İzin gruplarını ekle
        const createdGroups = yield PermissionGroup_1.default.insertMany(permissionGroups);
        console.log(`${createdGroups.length} izin grubu eklendi`);
        // Grup ID'lerini kod bazında eşleştir
        const groupMap = new Map();
        for (const group of createdGroups) {
            groupMap.set(group.code, group._id);
        }
        // İzinleri ekle
        const permissionsToInsert = permissionDefinitions.map(perm => ({
            name: perm.name,
            code: perm.code,
            description: perm.description,
            permissionGroup: groupMap.get(perm.groupCode)
        }));
        const createdPermissions = yield Permission_1.default.insertMany(permissionsToInsert);
        console.log(`${createdPermissions.length} izin eklendi`);
        // System Admin rolünü oluştur ve tüm izinleri ekle
        const systemAdminRole = yield Role_1.default.create({
            name: 'System Admin',
            description: 'Tüm sistem yetkileri olan yönetici rolü',
            permissions: createdPermissions.map(perm => perm._id),
            isActive: true
        });
        console.log(`System Admin rolü oluşturuldu: ${systemAdminRole.name}`);
        // Mevcut admin kullanıcısını kontrol et
        const existingAdmin = yield User_1.default.findOne({ email: 'admin@spesengine.com' });
        if (existingAdmin) {
            // Varsa rolünü güncelle
            existingAdmin.role = systemAdminRole._id;
            existingAdmin.isAdmin = true;
            yield existingAdmin.save();
            console.log('Mevcut admin kullanıcısı güncellendi');
        }
        else {
            // Yoksa yeni admin kullanıcısı oluştur
            const adminUser = yield User_1.default.create({
                name: 'System Admin',
                email: 'admin@spesengine.com',
                password: 'Admin123!',
                isAdmin: true,
                isActive: true,
                role: systemAdminRole._id
            });
            console.log(`Admin kullanıcısı oluşturuldu: ${adminUser.email}`);
        }
        console.log('Seed işlemi başarıyla tamamlandı');
        process.exit(0);
    }
    catch (error) {
        console.error('Seed işlemi sırasında hata oluştu:', error);
        process.exit(1);
    }
});
// Seed işlemini başlat
seedData();
