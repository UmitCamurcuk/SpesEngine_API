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
import Role from '../models/Role';
import Permission from '../models/Permission';
import PermissionGroup from '../models/PermissionGroup';

async function seed() {
  await connectDB();
  console.log('Veritabanı bağlantısı başarılı. Elektronik Ürün Stok Takibi demo verisi ekleniyor...');

  try {
    // Mevcut verileri temizle
    console.log('Mevcut veriler temizleniyor...');
    
    // Önce ilişkileri temizle (foreign key bağımlılıkları nedeniyle)
    await Relationship.deleteMany({});
    await RelationshipType.deleteMany({});
    
    // Sonra diğer koleksiyonları temizle
    await Item.deleteMany({});
    await Attribute.deleteMany({});
    await AttributeGroup.deleteMany({});
    await Category.deleteMany({});
    await Family.deleteMany({});
    await ItemType.deleteMany({});
    
    // Rol ve izinleri temizle
    await Role.deleteMany({});
    await Permission.deleteMany({});
    await PermissionGroup.deleteMany({});
    
    // Kullanıcıları temizle
    await User.deleteMany({});
    
    console.log('Mevcut veriler temizlendi. Yeni veriler yükleniyor...');
    
    // 1. İzin grupları oluşturma
    const permissionGroups = [
      { name: 'Ürün Yönetimi', code: 'PRODUCTS', description: 'Elektronik ürünlerin yönetimi için izinler', isActive: true },
      { name: 'Stok Yönetimi', code: 'INVENTORY', description: 'Stok yönetimi için izinler', isActive: true },
      { name: 'Müşteri Yönetimi', code: 'CUSTOMERS', description: 'Müşteri yönetimi için izinler', isActive: true },
      { name: 'Sipariş Yönetimi', code: 'ORDERS', description: 'Sipariş yönetimi için izinler', isActive: true },
      { name: 'Fatura Yönetimi', code: 'INVOICES', description: 'Fatura yönetimi için izinler', isActive: true },
      { name: 'Raporlama', code: 'REPORTING', description: 'Raporlama için izinler', isActive: true },
      { name: 'Kullanıcı Yönetimi', code: 'USERS', description: 'Kullanıcıların yönetimi için izinler', isActive: true },
      { name: 'Rol Yönetimi', code: 'ROLES', description: 'Kullanıcı rollerinin yönetimi için izinler', isActive: true },
      { name: 'Tedarikçi Yönetimi', code: 'SUPPLIERS', description: 'Tedarikçi yönetimi için izinler', isActive: true },
      { name: 'Servis Yönetimi', code: 'SERVICES', description: 'Servis ve tamir işlemleri için izinler', isActive: true },
    ];

    // İzin gruplarını veritabanına ekle
    const createdPermissionGroups = await Promise.all(
      permissionGroups.map(group => PermissionGroup.create(group))
    );

    console.log(`${createdPermissionGroups.length} izin grubu eklendi`);

    // Grup ID'lerini kod bazında eşleştir
    const permissionGroupMap = new Map();
    createdPermissionGroups.forEach(group => {
      permissionGroupMap.set(group.code, group._id);
    });

    // İzin tanımları
    const permissionDefinitions = [
      // Ürün Yönetimi İzinleri
      { name: 'Ürünleri Görüntüleme', code: 'PRODUCTS_VIEW', groupCode: 'PRODUCTS', description: 'Elektronik ürünleri görüntüleme izni' },
      { name: 'Ürün Ekleme', code: 'PRODUCTS_CREATE', groupCode: 'PRODUCTS', description: 'Yeni elektronik ürün ekleme izni' },
      { name: 'Ürün Güncelleme', code: 'PRODUCTS_UPDATE', groupCode: 'PRODUCTS', description: 'Elektronik ürünleri güncelleme izni' },
      { name: 'Ürün Silme', code: 'PRODUCTS_DELETE', groupCode: 'PRODUCTS', description: 'Elektronik ürün silme izni' },
      
      // Stok Yönetimi İzinleri
      { name: 'Stok Görüntüleme', code: 'INVENTORY_VIEW', groupCode: 'INVENTORY', description: 'Stok bilgilerini görüntüleme izni' },
      { name: 'Stok Güncelleme', code: 'INVENTORY_UPDATE', groupCode: 'INVENTORY', description: 'Stok bilgilerini güncelleme izni' },
      { name: 'Stok Transferi', code: 'INVENTORY_TRANSFER', groupCode: 'INVENTORY', description: 'Stok transferi yapma izni' },
      { name: 'Stok Sayımı', code: 'INVENTORY_COUNT', groupCode: 'INVENTORY', description: 'Stok sayımı yapma izni' },
      
      // Müşteri Yönetimi İzinleri
      { name: 'Müşterileri Görüntüleme', code: 'CUSTOMERS_VIEW', groupCode: 'CUSTOMERS', description: 'Müşteri bilgilerini görüntüleme izni' },
      { name: 'Müşteri Ekleme', code: 'CUSTOMERS_CREATE', groupCode: 'CUSTOMERS', description: 'Yeni müşteri ekleme izni' },
      { name: 'Müşteri Güncelleme', code: 'CUSTOMERS_UPDATE', groupCode: 'CUSTOMERS', description: 'Müşteri bilgilerini güncelleme izni' },
      { name: 'Müşteri Silme', code: 'CUSTOMERS_DELETE', groupCode: 'CUSTOMERS', description: 'Müşteri silme izni' },
      
      // Sipariş Yönetimi İzinleri
      { name: 'Siparişleri Görüntüleme', code: 'ORDERS_VIEW', groupCode: 'ORDERS', description: 'Sipariş bilgilerini görüntüleme izni' },
      { name: 'Sipariş Oluşturma', code: 'ORDERS_CREATE', groupCode: 'ORDERS', description: 'Yeni sipariş oluşturma izni' },
      { name: 'Sipariş Güncelleme', code: 'ORDERS_UPDATE', groupCode: 'ORDERS', description: 'Sipariş bilgilerini güncelleme izni' },
      { name: 'Sipariş İptal', code: 'ORDERS_CANCEL', groupCode: 'ORDERS', description: 'Sipariş iptal etme izni' },
      
      // Fatura Yönetimi İzinleri
      { name: 'Faturaları Görüntüleme', code: 'INVOICES_VIEW', groupCode: 'INVOICES', description: 'Fatura bilgilerini görüntüleme izni' },
      { name: 'Fatura Oluşturma', code: 'INVOICES_CREATE', groupCode: 'INVOICES', description: 'Yeni fatura oluşturma izni' },
      { name: 'Fatura Güncelleme', code: 'INVOICES_UPDATE', groupCode: 'INVOICES', description: 'Fatura bilgilerini güncelleme izni' },
      { name: 'Fatura İptal', code: 'INVOICES_CANCEL', groupCode: 'INVOICES', description: 'Fatura iptal etme izni' },
      
      // Raporlama İzinleri
      { name: 'Satış Raporları', code: 'REPORTING_SALES', groupCode: 'REPORTING', description: 'Satış raporlarını görüntüleme izni' },
      { name: 'Stok Raporları', code: 'REPORTING_INVENTORY', groupCode: 'REPORTING', description: 'Stok raporlarını görüntüleme izni' },
      { name: 'Müşteri Raporları', code: 'REPORTING_CUSTOMERS', groupCode: 'REPORTING', description: 'Müşteri raporlarını görüntüleme izni' },
      { name: 'Finansal Raporlar', code: 'REPORTING_FINANCE', groupCode: 'REPORTING', description: 'Finansal raporları görüntüleme izni' },
      
      // Kullanıcı Yönetimi İzinleri
      { name: 'Kullanıcıları Görüntüleme', code: 'USERS_VIEW', groupCode: 'USERS', description: 'Kullanıcı bilgilerini görüntüleme izni' },
      { name: 'Kullanıcı Ekleme', code: 'USERS_CREATE', groupCode: 'USERS', description: 'Yeni kullanıcı ekleme izni' },
      { name: 'Kullanıcı Güncelleme', code: 'USERS_UPDATE', groupCode: 'USERS', description: 'Kullanıcı bilgilerini güncelleme izni' },
      { name: 'Kullanıcı Silme', code: 'USERS_DELETE', groupCode: 'USERS', description: 'Kullanıcı silme izni' },
      
      // Rol Yönetimi İzinleri
      { name: 'Rolleri Görüntüleme', code: 'ROLES_VIEW', groupCode: 'ROLES', description: 'Rol bilgilerini görüntüleme izni' },
      { name: 'Rol Ekleme', code: 'ROLES_CREATE', groupCode: 'ROLES', description: 'Yeni rol ekleme izni' },
      { name: 'Rol Güncelleme', code: 'ROLES_UPDATE', groupCode: 'ROLES', description: 'Rol bilgilerini güncelleme izni' },
      { name: 'Rol Silme', code: 'ROLES_DELETE', groupCode: 'ROLES', description: 'Rol silme izni' },
      
      // Tedarikçi Yönetimi İzinleri
      { name: 'Tedarikçileri Görüntüleme', code: 'SUPPLIERS_VIEW', groupCode: 'SUPPLIERS', description: 'Tedarikçi bilgilerini görüntüleme izni' },
      { name: 'Tedarikçi Ekleme', code: 'SUPPLIERS_CREATE', groupCode: 'SUPPLIERS', description: 'Yeni tedarikçi ekleme izni' },
      { name: 'Tedarikçi Güncelleme', code: 'SUPPLIERS_UPDATE', groupCode: 'SUPPLIERS', description: 'Tedarikçi bilgilerini güncelleme izni' },
      { name: 'Tedarikçi Silme', code: 'SUPPLIERS_DELETE', groupCode: 'SUPPLIERS', description: 'Tedarikçi silme izni' },
      
      // Servis Yönetimi İzinleri
      { name: 'Servis Kayıtlarını Görüntüleme', code: 'SERVICES_VIEW', groupCode: 'SERVICES', description: 'Servis kayıtlarını görüntüleme izni' },
      { name: 'Servis Kaydı Oluşturma', code: 'SERVICES_CREATE', groupCode: 'SERVICES', description: 'Yeni servis kaydı oluşturma izni' },
      { name: 'Servis Kaydı Güncelleme', code: 'SERVICES_UPDATE', groupCode: 'SERVICES', description: 'Servis kaydı güncelleme izni' },
      { name: 'Servis Kaydı Silme', code: 'SERVICES_DELETE', groupCode: 'SERVICES', description: 'Servis kaydı silme izni' },
    ];

    // İzinleri veritabanına ekle
    const createdPermissions = await Promise.all(
      permissionDefinitions.map(perm => Permission.create({
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
    
    // 2. Roller oluşturma
    const roles = [
      {
        name: 'Sistem Yöneticisi',
        description: 'Tam yetkili sistem yöneticisi',
        permissions: createdPermissions.map(perm => perm._id),
        isActive: true
      },
      {
        name: 'Ürün Yöneticisi',
        description: 'Ürün ve stok yönetimi ile ilgili işlemleri yapabilir',
        permissions: [
          ...createdPermissions.filter(p => p.code.startsWith('PRODUCTS_')).map(p => p._id),
          ...createdPermissions.filter(p => p.code.startsWith('INVENTORY_')).map(p => p._id),
          ...createdPermissions.filter(p => p.code.startsWith('SUPPLIERS_VIEW')).map(p => p._id),
          permissionCodeMap.get('REPORTING_INVENTORY')
        ],
        isActive: true
      },
      {
        name: 'Satış Temsilcisi',
        description: 'Müşteri ve sipariş yönetimi ile ilgili işlemleri yapabilir',
        permissions: [
          ...createdPermissions.filter(p => p.code.startsWith('CUSTOMERS_')).map(p => p._id),
          ...createdPermissions.filter(p => p.code.startsWith('ORDERS_')).map(p => p._id),
          ...createdPermissions.filter(p => p.code.startsWith('INVOICES_')).map(p => p._id),
          permissionCodeMap.get('PRODUCTS_VIEW'),
          permissionCodeMap.get('INVENTORY_VIEW'),
          permissionCodeMap.get('REPORTING_SALES'),
          permissionCodeMap.get('REPORTING_CUSTOMERS')
        ],
        isActive: true
      },
      {
        name: 'Stok Görevlisi',
        description: 'Stok yönetimi ile ilgili işlemleri yapabilir',
        permissions: [
          ...createdPermissions.filter(p => p.code.startsWith('INVENTORY_')).map(p => p._id),
          permissionCodeMap.get('PRODUCTS_VIEW'),
          permissionCodeMap.get('SUPPLIERS_VIEW'),
          permissionCodeMap.get('REPORTING_INVENTORY')
        ],
        isActive: true
      },
      {
        name: 'Muhasebe Görevlisi',
        description: 'Fatura ve finansal işlemler ile ilgili işlemleri yapabilir',
        permissions: [
          ...createdPermissions.filter(p => p.code.startsWith('INVOICES_')).map(p => p._id),
          permissionCodeMap.get('ORDERS_VIEW'),
          permissionCodeMap.get('CUSTOMERS_VIEW'),
          permissionCodeMap.get('REPORTING_FINANCE'),
          permissionCodeMap.get('REPORTING_SALES')
        ],
        isActive: true
      },
      {
        name: 'Servis Teknisyeni',
        description: 'Servis ve tamir işlemleri ile ilgili işlemleri yapabilir',
        permissions: [
          ...createdPermissions.filter(p => p.code.startsWith('SERVICES_')).map(p => p._id),
          permissionCodeMap.get('PRODUCTS_VIEW'),
          permissionCodeMap.get('CUSTOMERS_VIEW'),
          permissionCodeMap.get('INVENTORY_VIEW')
        ],
        isActive: true
      },
      {
        name: 'Raporlama Uzmanı',
        description: 'Tüm raporlama işlemlerini yapabilir',
        permissions: [
          ...createdPermissions.filter(p => p.code.startsWith('REPORTING_')).map(p => p._id),
          permissionCodeMap.get('PRODUCTS_VIEW'),
          permissionCodeMap.get('INVENTORY_VIEW'),
          permissionCodeMap.get('CUSTOMERS_VIEW'),
          permissionCodeMap.get('ORDERS_VIEW'),
          permissionCodeMap.get('INVOICES_VIEW'),
          permissionCodeMap.get('SERVICES_VIEW'),
          permissionCodeMap.get('SUPPLIERS_VIEW')
        ],
        isActive: true
      }
    ];

    // Rolleri veritabanına ekle
    const createdRoles = await Promise.all(
      roles.map(role => Role.create(role))
    );

    console.log(`${createdRoles.length} rol eklendi`);

    // Rol adlarını ID ile eşleştirme
    const roleNameMap = new Map();
    createdRoles.forEach(role => {
      roleNameMap.set(role.name, role._id);
    });
    
    // 3. Kullanıcılar oluşturma
    const users = [
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Admin123!',
        role: roleNameMap.get('Sistem Yöneticisi'),
        isAdmin: true,
        isActive: true
      },
      {
        name: 'Mehmet Ürün',
        email: 'mehmet@example.com',
        password: 'Mehmet123!',
        role: roleNameMap.get('Ürün Yöneticisi'),
        isAdmin: false,
        isActive: true
      },
      {
        name: 'Ayşe Satış',
        email: 'ayse@example.com',
        password: 'Ayse123!',
        role: roleNameMap.get('Satış Temsilcisi'),
        isAdmin: false,
        isActive: true
      },
      {
        name: 'Ali Stok',
        email: 'ali@example.com',
        password: 'Ali123!',
        role: roleNameMap.get('Stok Görevlisi'),
        isAdmin: false,
        isActive: true
      },
      {
        name: 'Fatma Muhasebe',
        email: 'fatma@example.com',
        password: 'Fatma123!',
        role: roleNameMap.get('Muhasebe Görevlisi'),
        isAdmin: false,
        isActive: true
      },
      {
        name: 'Hasan Servis',
        email: 'hasan@example.com',
        password: 'Hasan123!',
        role: roleNameMap.get('Servis Teknisyeni'),
        isAdmin: false,
        isActive: true
      },
      {
        name: 'Zeynep Rapor',
        email: 'zeynep@example.com',
        password: 'Zeynep123!',
        role: roleNameMap.get('Raporlama Uzmanı'),
        isAdmin: false,
        isActive: true
      }
    ];

    // Kullanıcıları veritabanına ekle
    const createdUsers = await Promise.all(
      users.map(user => User.create(user))
    );

    console.log(`${createdUsers.length} kullanıcı eklendi`);
    
    // 4. Öznitelik grupları oluşturma
    const attributeGroups = [
      {
        name: 'Temel Bilgiler',
        code: 'BASIC_INFO',
        description: 'Ürünün temel özellikleri',
        isActive: true
      },
      {
        name: 'Teknik Özellikler',
        code: 'TECHNICAL_SPECS',
        description: 'Ürünün teknik özellikleri',
        isActive: true
      },
      {
        name: 'Fiziksel Özellikler',
        code: 'PHYSICAL_SPECS',
        description: 'Ürünün fiziksel özellikleri',
        isActive: true
      },
      {
        name: 'Lojistik Bilgiler',
        code: 'LOGISTICS',
        description: 'Lojistik ve depolama bilgileri',
        isActive: true
      },
      {
        name: 'Fiyatlandırma',
        code: 'PRICING',
        description: 'Fiyat ve maliyet bilgileri',
        isActive: true
      },
      {
        name: 'Stok Bilgileri',
        code: 'INVENTORY',
        description: 'Stok ve envanter bilgileri',
        isActive: true
      },
      {
        name: 'Müşteri Bilgileri',
        code: 'CUSTOMER_INFO',
        description: 'Müşteri bilgileri',
        isActive: true
      },
      {
        name: 'Sipariş Bilgileri',
        code: 'ORDER_INFO',
        description: 'Sipariş bilgileri',
        isActive: true
      },
      {
        name: 'Fatura Bilgileri',
        code: 'INVOICE_INFO',
        description: 'Fatura bilgileri',
        isActive: true
      },
      {
        name: 'Tedarikçi Bilgileri',
        code: 'SUPPLIER_INFO',
        description: 'Tedarikçi bilgileri',
        isActive: true
      },
      {
        name: 'Servis Bilgileri',
        code: 'SERVICE_INFO',
        description: 'Servis ve tamir bilgileri',
        isActive: true
      }
    ];

    // Öznitelik gruplarını veritabanına ekle
    const createdAttributeGroups = await Promise.all(
      attributeGroups.map(group => AttributeGroup.create(group))
    );

    console.log(`${createdAttributeGroups.length} öznitelik grubu eklendi`);

    // Grup adlarını ID ile eşleştirme
    const attrGroupNameMap = new Map();
    createdAttributeGroups.forEach(group => {
      attrGroupNameMap.set(group.name, group._id);
    });

    // 5. Öznitelikler oluşturma
    const attributes = [
      // Temel Bilgiler grubu öznitelikleri
      {
        name: 'Marka',
        code: 'brand',
        type: AttributeType.TEXT,
        description: 'Ürün markası',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Temel Bilgiler'),
        isActive: true
      },
      {
        name: 'Model',
        code: 'model',
        type: AttributeType.TEXT,
        description: 'Ürün modeli',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Temel Bilgiler'),
        isActive: true
      },
      {
        name: 'Seri Numarası',
        code: 'serialNumber',
        type: AttributeType.TEXT,
        description: 'Ürün seri numarası',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Temel Bilgiler'),
        isActive: true
      },
      {
        name: 'Garanti Süresi',
        code: 'warrantyPeriod',
        type: AttributeType.NUMBER,
        description: 'Ay cinsinden garanti süresi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Temel Bilgiler'),
        isActive: true,
        validations: {
          min: 0,
          max: 120,
          isInteger: true
        }
      },
      {
        name: 'Üretim Tarihi',
        code: 'productionDate',
        type: AttributeType.DATE,
        description: 'Ürünün üretim tarihi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Temel Bilgiler'),
        isActive: true
      },
      
      // Teknik Özellikler grubu öznitelikleri
      {
        name: 'İşlemci',
        code: 'processor',
        type: AttributeType.TEXT,
        description: 'İşlemci modeli',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Teknik Özellikler'),
        isActive: true
      },
      {
        name: 'RAM',
        code: 'ram',
        type: AttributeType.NUMBER,
        description: 'GB cinsinden RAM miktarı',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Teknik Özellikler'),
        isActive: true,
        validations: {
          min: 1,
          max: 128,
          isInteger: true
        }
      },
      {
        name: 'Depolama',
        code: 'storage',
        type: AttributeType.NUMBER,
        description: 'GB cinsinden depolama kapasitesi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Teknik Özellikler'),
        isActive: true,
        validations: {
          min: 1,
          isInteger: true
        }
      },
      {
        name: 'Ekran Boyutu',
        code: 'screenSize',
        type: AttributeType.NUMBER,
        description: 'İnç cinsinden ekran boyutu',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Teknik Özellikler'),
        isActive: true,
        validations: {
          min: 1,
          max: 100
        }
      },
      {
        name: 'Çözünürlük',
        code: 'resolution',
        type: AttributeType.TEXT,
        description: 'Ekran çözünürlüğü',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Teknik Özellikler'),
        isActive: true
      },
      {
        name: 'İşletim Sistemi',
        code: 'operatingSystem',
        type: AttributeType.SELECT,
        description: 'İşletim sistemi',
        isRequired: false,
        options: ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Diğer'],
        attributeGroup: attrGroupNameMap.get('Teknik Özellikler'),
        isActive: true
      },
      
      // Fiziksel Özellikler grubu öznitelikleri
      {
        name: 'Renk',
        code: 'color',
        type: AttributeType.TEXT,
        description: 'Ürün rengi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Fiziksel Özellikler'),
        isActive: true
      },
      {
        name: 'Ağırlık',
        code: 'weight',
        type: AttributeType.NUMBER,
        description: 'Gram cinsinden ağırlık',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Fiziksel Özellikler'),
        isActive: true,
        validations: {
          min: 0
        }
      },
      {
        name: 'Boyutlar',
        code: 'dimensions',
        type: AttributeType.TEXT,
        description: 'Ürün boyutları (En x Boy x Yükseklik)',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Fiziksel Özellikler'),
        isActive: true
      },
      {
        name: 'Materyal',
        code: 'material',
        type: AttributeType.TEXT,
        description: 'Ana gövde materyali',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Fiziksel Özellikler'),
        isActive: true
      },
      
      // Lojistik Bilgiler grubu öznitelikleri
      {
        name: 'Depo Konumu',
        code: 'warehouseLocation',
        type: AttributeType.TEXT,
        description: 'Depodaki konum bilgisi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Lojistik Bilgiler'),
        isActive: true
      },
      {
        name: 'Kargo Boyutu',
        code: 'shippingSize',
        type: AttributeType.SELECT,
        description: 'Kargo paketi boyutu',
        isRequired: false,
        options: ['Küçük', 'Orta', 'Büyük', 'Çok Büyük'],
        attributeGroup: attrGroupNameMap.get('Lojistik Bilgiler'),
        isActive: true
      },
      {
        name: 'Kırılgan',
        code: 'fragile',
        type: AttributeType.BOOLEAN,
        description: 'Ürün kırılgan mı?',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Lojistik Bilgiler'),
        isActive: true
      },
      
      // Fiyatlandırma grubu öznitelikleri
      {
        name: 'Alış Fiyatı',
        code: 'costPrice',
        type: AttributeType.NUMBER,
        description: 'Ürün alış fiyatı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fiyatlandırma'),
        isActive: true,
        validations: {
          min: 0
        }
      },
      {
        name: 'Satış Fiyatı',
        code: 'sellingPrice',
        type: AttributeType.NUMBER,
        description: 'Ürün satış fiyatı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fiyatlandırma'),
        isActive: true,
        validations: {
          min: 0
        }
      },
      {
        name: 'İndirim Oranı',
        code: 'discountRate',
        type: AttributeType.NUMBER,
        description: 'Yüzde cinsinden indirim oranı',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Fiyatlandırma'),
        isActive: true,
        validations: {
          min: 0,
          max: 100
        }
      },
      {
        name: 'KDV Oranı',
        code: 'taxRate',
        type: AttributeType.NUMBER,
        description: 'Yüzde cinsinden KDV oranı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fiyatlandırma'),
        isActive: true,
        validations: {
          min: 0,
          max: 100
        }
      },
      
      // Stok Bilgileri grubu öznitelikleri
      {
        name: 'Stok Miktarı',
        code: 'stockQuantity',
        type: AttributeType.NUMBER,
        description: 'Mevcut stok miktarı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Stok Bilgileri'),
        isActive: true,
        validations: {
          min: 0,
          isInteger: true
        }
      },
      {
        name: 'Minimum Stok Seviyesi',
        code: 'minStockLevel',
        type: AttributeType.NUMBER,
        description: 'Minimum stok seviyesi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Stok Bilgileri'),
        isActive: true,
        validations: {
          min: 0,
          isInteger: true
        }
      },
      {
        name: 'Rezerve Stok',
        code: 'reservedStock',
        type: AttributeType.NUMBER,
        description: 'Sipariş için ayrılmış stok miktarı',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Stok Bilgileri'),
        isActive: true,
        validations: {
          min: 0,
          isInteger: true
        }
      },
      {
        name: 'Son Stok Girişi',
        code: 'lastStockIn',
        type: AttributeType.DATE,
        description: 'Son stok giriş tarihi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Stok Bilgileri'),
        isActive: true
      },
      {
        name: 'Son Stok Çıkışı',
        code: 'lastStockOut',
        type: AttributeType.DATE,
        description: 'Son stok çıkış tarihi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Stok Bilgileri'),
        isActive: true
      },
      
      // Müşteri Bilgileri grubu öznitelikleri
      {
        name: 'Müşteri Adı',
        code: 'customerName',
        type: AttributeType.TEXT,
        description: 'Müşteri adı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Müşteri Bilgileri'),
        isActive: true
      },
      {
        name: 'Müşteri Soyadı',
        code: 'customerSurname',
        type: AttributeType.TEXT,
        description: 'Müşteri soyadı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Müşteri Bilgileri'),
        isActive: true
      },
      {
        name: 'Telefon',
        code: 'phone',
        type: AttributeType.TEXT,
        description: 'Müşteri telefon numarası',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Müşteri Bilgileri'),
        isActive: true
      },
      {
        name: 'E-posta',
        code: 'email',
        type: AttributeType.TEXT,
        description: 'Müşteri e-posta adresi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Müşteri Bilgileri'),
        isActive: true
      },
      {
        name: 'Adres',
        code: 'address',
        type: AttributeType.TEXT,
        description: 'Müşteri adresi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Müşteri Bilgileri'),
        isActive: true
      },
      {
        name: 'Müşteri Tipi',
        code: 'customerType',
        type: AttributeType.SELECT,
        description: 'Müşteri tipi',
        isRequired: true,
        options: ['Bireysel', 'Kurumsal'],
        attributeGroup: attrGroupNameMap.get('Müşteri Bilgileri'),
        isActive: true
      },
      
      // Sipariş Bilgileri grubu öznitelikleri
      {
        name: 'Sipariş Tarihi',
        code: 'orderDate',
        type: AttributeType.DATE,
        description: 'Sipariş tarihi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Sipariş Bilgileri'),
        isActive: true
      },
      {
        name: 'Tahmini Teslimat Tarihi',
        code: 'estimatedDeliveryDate',
        type: AttributeType.DATE,
        description: 'Tahmini teslimat tarihi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Sipariş Bilgileri'),
        isActive: true
      },
      {
        name: 'Sipariş Durumu',
        code: 'orderStatus',
        type: AttributeType.SELECT,
        description: 'Sipariş durumu',
        isRequired: true,
        options: ['Beklemede', 'Onaylandı', 'Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi'],
        attributeGroup: attrGroupNameMap.get('Sipariş Bilgileri'),
        isActive: true
      },
      {
        name: 'Ödeme Şekli',
        code: 'paymentMethod',
        type: AttributeType.SELECT,
        description: 'Ödeme şekli',
        isRequired: true,
        options: ['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Kapıda Ödeme'],
        attributeGroup: attrGroupNameMap.get('Sipariş Bilgileri'),
        isActive: true
      },
      {
        name: 'Kargo Şirketi',
        code: 'shippingCompany',
        type: AttributeType.TEXT,
        description: 'Kargo şirketi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Sipariş Bilgileri'),
        isActive: true
      },
      {
        name: 'Takip Numarası',
        code: 'trackingNumber',
        type: AttributeType.TEXT,
        description: 'Kargo takip numarası',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Sipariş Bilgileri'),
        isActive: true
      },
      
      // Fatura Bilgileri grubu öznitelikleri
      {
        name: 'Fatura Numarası',
        code: 'invoiceNumber',
        type: AttributeType.TEXT,
        description: 'Fatura numarası',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fatura Bilgileri'),
        isActive: true
      },
      {
        name: 'Fatura Tarihi',
        code: 'invoiceDate',
        type: AttributeType.DATE,
        description: 'Fatura tarihi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fatura Bilgileri'),
        isActive: true
      },
      {
        name: 'Toplam Tutar',
        code: 'totalAmount',
        type: AttributeType.NUMBER,
        description: 'Toplam fatura tutarı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fatura Bilgileri'),
        isActive: true,
        validations: {
          min: 0
        }
      },
      {
        name: 'Vergi Tutarı',
        code: 'taxAmount',
        type: AttributeType.NUMBER,
        description: 'Toplam vergi tutarı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fatura Bilgileri'),
        isActive: true,
        validations: {
          min: 0
        }
      },
      {
        name: 'Fatura Adresi',
        code: 'invoiceAddress',
        type: AttributeType.TEXT,
        description: 'Fatura adresi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Fatura Bilgileri'),
        isActive: true
      },
      {
        name: 'Fatura Durumu',
        code: 'invoiceStatus',
        type: AttributeType.SELECT,
        description: 'Fatura durumu',
        isRequired: true,
        options: ['Ödenmedi', 'Kısmen Ödendi', 'Ödendi', 'İptal Edildi'],
        attributeGroup: attrGroupNameMap.get('Fatura Bilgileri'),
        isActive: true
      },
      
      // Tedarikçi Bilgileri grubu öznitelikleri
      {
        name: 'Tedarikçi Adı',
        code: 'supplierName',
        type: AttributeType.TEXT,
        description: 'Tedarikçi firma adı',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Tedarikçi Bilgileri'),
        isActive: true
      },
      {
        name: 'Tedarikçi İletişim Kişisi',
        code: 'supplierContactPerson',
        type: AttributeType.TEXT,
        description: 'Tedarikçi firma iletişim kişisi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Tedarikçi Bilgileri'),
        isActive: true
      },
      {
        name: 'Tedarikçi Telefon',
        code: 'supplierPhone',
        type: AttributeType.TEXT,
        description: 'Tedarikçi telefon numarası',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Tedarikçi Bilgileri'),
        isActive: true
      },
      {
        name: 'Tedarikçi E-posta',
        code: 'supplierEmail',
        type: AttributeType.TEXT,
        description: 'Tedarikçi e-posta adresi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Tedarikçi Bilgileri'),
        isActive: true
      },
      {
        name: 'Tedarikçi Adresi',
        code: 'supplierAddress',
        type: AttributeType.TEXT,
        description: 'Tedarikçi adresi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Tedarikçi Bilgileri'),
        isActive: true
      },
      {
        name: 'Tedarikçi Ödeme Vadesi',
        code: 'supplierPaymentTerm',
        type: AttributeType.NUMBER,
        description: 'Gün cinsinden ödeme vadesi',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Tedarikçi Bilgileri'),
        isActive: true,
        validations: {
          min: 0,
          isInteger: true
        }
      },
      
      // Servis Bilgileri grubu öznitelikleri
      {
        name: 'Servis Tarihi',
        code: 'serviceDate',
        type: AttributeType.DATE,
        description: 'Servis işlem tarihi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Servis Bilgileri'),
        isActive: true
      },
      {
        name: 'Servis Türü',
        code: 'serviceType',
        type: AttributeType.SELECT,
        description: 'Servis işlem türü',
        isRequired: true,
        options: ['Garanti Kapsamında Onarım', 'Ücretli Onarım', 'Yazılım Güncelleme', 'Kontrol/Bakım'],
        attributeGroup: attrGroupNameMap.get('Servis Bilgileri'),
        isActive: true
      },
      {
        name: 'Teknisyen',
        code: 'technician',
        type: AttributeType.TEXT,
        description: 'Servis işlemini yapan teknisyen',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Servis Bilgileri'),
        isActive: true
      },
      {
        name: 'Arıza Açıklaması',
        code: 'faultDescription',
        type: AttributeType.TEXT,
        description: 'Müşteri tarafından bildirilen arıza',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Servis Bilgileri'),
        isActive: true
      },
      {
        name: 'Yapılan İşlem',
        code: 'serviceAction',
        type: AttributeType.TEXT,
        description: 'Yapılan servis işlemi',
        isRequired: true,
        attributeGroup: attrGroupNameMap.get('Servis Bilgileri'),
        isActive: true
      },
      {
        name: 'Servis Durumu',
        code: 'serviceStatus',
        type: AttributeType.SELECT,
        description: 'Servis işlem durumu',
        isRequired: true,
        options: ['Bekliyor', 'İşleme Alındı', 'Parça Bekliyor', 'Tamamlandı', 'Teslim Edildi', 'İptal Edildi'],
        attributeGroup: attrGroupNameMap.get('Servis Bilgileri'),
        isActive: true
      },
      {
        name: 'Servis Ücreti',
        code: 'serviceFee',
        type: AttributeType.NUMBER,
        description: 'Servis işlem ücreti',
        isRequired: false,
        attributeGroup: attrGroupNameMap.get('Servis Bilgileri'),
        isActive: true,
        validations: {
          min: 0
        }
      }
    ];

    // Öznitelikleri veritabanına ekle
    const createdAttributes = await Promise.all(
      attributes.map(attr => Attribute.create(attr))
    );

    console.log(`${createdAttributes.length} öznitelik eklendi`);

    // Öznitelik kodlarını ID ile eşleştirme
    const attributeCodeMap = new Map();
    createdAttributes.forEach(attr => {
      attributeCodeMap.set(attr.code, attr._id);
    });
    
    // 6. Kategorileri oluşturma
    const categories = [
      // Elektronik Ürünler Ana Kategorileri
      {
        name: 'Elektronik Ürünler',
        code: 'ELECTRONIC_PRODUCTS',
        description: 'Tüm elektronik ürünler',
        isActive: true
      },
      
      // Bilgisayar Alt Kategorileri
      {
        name: 'Bilgisayarlar',
        code: 'COMPUTERS',
        description: 'Tüm bilgisayar ürünleri',
        isActive: true
      },
      {
        name: 'Dizüstü Bilgisayarlar',
        code: 'LAPTOPS',
        description: 'Dizüstü bilgisayarlar',
        isActive: true
      },
      {
        name: 'Masaüstü Bilgisayarlar',
        code: 'DESKTOPS',
        description: 'Masaüstü bilgisayarlar',
        isActive: true
      },
      {
        name: 'Tabletler',
        code: 'TABLETS',
        description: 'Tablet bilgisayarlar',
        isActive: true
      },
      
      // Telefon Alt Kategorileri
      {
        name: 'Telefonlar',
        code: 'PHONES',
        description: 'Tüm telefon ürünleri',
        isActive: true
      },
      {
        name: 'Akıllı Telefonlar',
        code: 'SMARTPHONES',
        description: 'Akıllı telefonlar',
        isActive: true
      },
      {
        name: 'Klasik Telefonlar',
        code: 'CLASSIC_PHONES',
        description: 'Klasik telefonlar',
        isActive: true
      },
      
      // TV Alt Kategorileri
      {
        name: 'TV ve Ses Sistemleri',
        code: 'TV_AUDIO',
        description: 'Televizyonlar ve ses sistemleri',
        isActive: true
      },
      {
        name: 'Televizyonlar',
        code: 'TELEVISIONS',
        description: 'Televizyonlar',
        isActive: true
      },
      {
        name: 'Ses Sistemleri',
        code: 'SOUND_SYSTEMS',
        description: 'Ses sistemleri',
        isActive: true
      },
      
      // Müşteri Ana Kategorileri
      {
        name: 'Müşteriler',
        code: 'CUSTOMERS',
        description: 'Tüm müşteriler',
        isActive: true
      },
      {
        name: 'Bireysel Müşteriler',
        code: 'INDIVIDUAL_CUSTOMERS',
        description: 'Bireysel müşteriler',
        isActive: true
      },
      {
        name: 'Kurumsal Müşteriler',
        code: 'CORPORATE_CUSTOMERS',
        description: 'Kurumsal müşteriler',
        isActive: true
      },
      
      // Belge Ana Kategorileri
      {
        name: 'Belgeler',
        code: 'DOCUMENTS',
        description: 'Tüm belgeler',
        isActive: true
      },
      {
        name: 'Siparişler',
        code: 'ORDERS',
        description: 'Müşteri siparişleri',
        isActive: true
      },
      {
        name: 'Faturalar',
        code: 'INVOICES',
        description: 'Satış faturaları',
        isActive: true
      },
      {
        name: 'Raporlar',
        code: 'REPORTS',
        description: 'Satış ve stok raporları',
        isActive: true
      },
      
      // Tedarikçi Ana Kategorileri
      {
        name: 'Tedarikçiler',
        code: 'SUPPLIERS',
        description: 'Tüm tedarikçiler',
        isActive: true
      },
      {
        name: 'Yerli Tedarikçiler',
        code: 'LOCAL_SUPPLIERS',
        description: 'Yurt içi tedarikçiler',
        isActive: true
      },
      
      // Servis Ana Kategorileri
      {
        name: 'Servis İşlemleri',
        code: 'SERVICES',
        description: 'Tüm servis işlemleri',
        isActive: true
      },
      {
        name: 'Garanti Kapsamındaki Servisler',
        code: 'WARRANTY_SERVICES',
        description: 'Garanti kapsamındaki servis işlemleri',
        isActive: true
      },
      {
        name: 'Ücretli Servisler',
        code: 'PAID_SERVICES',
        description: 'Garanti dışı ücretli servis işlemleri',
        isActive: true
      }
    ];

    // Kategorileri veritabanına ekle
    const createdCategories = await Promise.all(
      categories.map(category => Category.create(category))
    );

    console.log(`${createdCategories.length} kategori eklendi`);

    // Kategori kodlarını ID ile eşleştirme
    const categoryCodeMap = new Map();
    createdCategories.forEach(category => {
      categoryCodeMap.set(category.code, category._id);
    });
    
    // Kategori hiyerarşisini oluşturma (parent-child ilişkileri)
    await Promise.all([
      // Elektronik Ürünler ana kategori altına alt kategorileri ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('COMPUTERS'), { parent: categoryCodeMap.get('ELECTRONIC_PRODUCTS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('PHONES'), { parent: categoryCodeMap.get('ELECTRONIC_PRODUCTS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('TV_AUDIO'), { parent: categoryCodeMap.get('ELECTRONIC_PRODUCTS') }),
      
      // Bilgisayar alt kategorilerini ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('LAPTOPS'), { parent: categoryCodeMap.get('COMPUTERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('DESKTOPS'), { parent: categoryCodeMap.get('COMPUTERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('TABLETS'), { parent: categoryCodeMap.get('COMPUTERS') }),
      
      // Telefonlar alt kategorilerini ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('SMARTPHONES'), { parent: categoryCodeMap.get('PHONES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('CLASSIC_PHONES'), { parent: categoryCodeMap.get('PHONES') }),
      
      // TV alt kategorilerini ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('TELEVISIONS'), { parent: categoryCodeMap.get('TV_AUDIO') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('SOUND_SYSTEMS'), { parent: categoryCodeMap.get('TV_AUDIO') }),
      
      // Müşteri ana kategorisi altına alt kategorileri ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('INDIVIDUAL_CUSTOMERS'), { parent: categoryCodeMap.get('CUSTOMERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('CORPORATE_CUSTOMERS'), { parent: categoryCodeMap.get('CUSTOMERS') }),
      
      // Belgeler ana kategorisi altına alt kategorileri ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('ORDERS'), { parent: categoryCodeMap.get('DOCUMENTS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('INVOICES'), { parent: categoryCodeMap.get('DOCUMENTS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('REPORTS'), { parent: categoryCodeMap.get('DOCUMENTS') }),
      
      // Tedarikçi ana kategorisi altına alt kategorileri ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('LOCAL_SUPPLIERS'), { parent: categoryCodeMap.get('SUPPLIERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('FOREIGN_SUPPLIERS'), { parent: categoryCodeMap.get('SUPPLIERS') }),
      
      // Servis ana kategorisi altına alt kategorileri ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('WARRANTY_SERVICES'), { parent: categoryCodeMap.get('SERVICES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('PAID_SERVICES'), { parent: categoryCodeMap.get('SERVICES') })
    ]);
    
    console.log('Kategori hiyerarşisi oluşturuldu');
    
    // 7. Aileleri oluşturma
    const families = [
      // Elektronik Ana Ailesi
      {
        name: 'Elektronik Ürünler',
        code: 'ELECTRONICS',
        description: 'Elektronik ürünler ailesi',
        category: categoryCodeMap.get('ELECTRONIC_PRODUCTS'),
        isActive: true
      },
      
      // Bilgisayar Alt Aileleri
      {
        name: 'Bilgisayarlar',
        code: 'COMPUTERS',
        description: 'Bilgisayar ailesi',
        category: categoryCodeMap.get('COMPUTERS'),
        isActive: true
      },
      {
        name: 'Dizüstü Bilgisayarlar',
        code: 'LAPTOPS',
        description: 'Dizüstü bilgisayar ailesi',
        category: categoryCodeMap.get('LAPTOPS'),
        isActive: true
      },
      {
        name: 'Masaüstü Bilgisayarlar',
        code: 'DESKTOPS',
        description: 'Masaüstü bilgisayar ailesi',
        category: categoryCodeMap.get('DESKTOPS'),
        isActive: true
      },
      {
        name: 'Tabletler',
        code: 'TABLETS',
        description: 'Tablet ailesi',
        category: categoryCodeMap.get('TABLETS'),
        isActive: true
      },
      
      // Telefon Alt Aileleri
      {
        name: 'Telefonlar',
        code: 'PHONES',
        description: 'Telefon ailesi',
        category: categoryCodeMap.get('PHONES'),
        isActive: true
      },
      {
        name: 'Akıllı Telefonlar',
        code: 'SMARTPHONES',
        description: 'Akıllı telefon ailesi',
        category: categoryCodeMap.get('SMARTPHONES'),
        isActive: true
      },
      
      // TV Alt Aileleri
      {
        name: 'TV ve Ses Sistemleri',
        code: 'TV_AUDIO',
        description: 'TV ve ses sistemleri ailesi',
        category: categoryCodeMap.get('TV_AUDIO'),
        isActive: true
      },
      {
        name: 'Televizyonlar',
        code: 'TELEVISIONS',
        description: 'Televizyon ailesi',
        category: categoryCodeMap.get('TELEVISIONS'),
        isActive: true
      },
      
      // Müşteri Ana Ailesi
      {
        name: 'Müşteriler',
        code: 'CUSTOMERS',
        description: 'Müşteriler ailesi',
        category: categoryCodeMap.get('CUSTOMERS'),
        isActive: true
      },
      {
        name: 'Bireysel Müşteriler',
        code: 'INDIVIDUAL_CUSTOMERS',
        description: 'Bireysel müşteriler ailesi',
        category: categoryCodeMap.get('INDIVIDUAL_CUSTOMERS'),
        isActive: true
      },
      {
        name: 'Kurumsal Müşteriler',
        code: 'CORPORATE_CUSTOMERS',
        description: 'Kurumsal müşteriler ailesi',
        category: categoryCodeMap.get('CORPORATE_CUSTOMERS'),
        isActive: true
      },
      
      // Belge Ana Ailesi
      {
        name: 'Belgeler',
        code: 'DOCUMENTS',
        description: 'Belgeler ailesi',
        category: categoryCodeMap.get('DOCUMENTS'),
        isActive: true
      },
      {
        name: 'Siparişler',
        code: 'ORDERS',
        description: 'Siparişler ailesi',
        category: categoryCodeMap.get('ORDERS'),
        isActive: true
      },
      {
        name: 'Faturalar',
        code: 'INVOICES',
        description: 'Faturalar ailesi',
        category: categoryCodeMap.get('INVOICES'),
        isActive: true
      },
      
      // Tedarikçi Ana Ailesi
      {
        name: 'Tedarikçiler',
        code: 'SUPPLIERS',
        description: 'Tedarikçiler ailesi',
        category: categoryCodeMap.get('SUPPLIERS'),
        isActive: true
      },
      {
        name: 'Yerli Tedarikçiler',
        code: 'LOCAL_SUPPLIERS',
        description: 'Yerli tedarikçiler ailesi',
        category: categoryCodeMap.get('LOCAL_SUPPLIERS'),
        isActive: true
      },
      
      // Servis Ana Ailesi
      {
        name: 'Servis İşlemleri',
        code: 'SERVICES',
        description: 'Servis işlemleri ailesi',
        category: categoryCodeMap.get('SERVICES'),
        isActive: true
      },
      {
        name: 'Garanti Servisleri',
        code: 'WARRANTY_SERVICES',
        description: 'Garanti servisleri ailesi',
        category: categoryCodeMap.get('WARRANTY_SERVICES'),
        isActive: true
      }
    ];

    // Aileleri veritabanına ekle
    const createdFamilies = await Promise.all(
      families.map(family => Family.create(family))
    );

    console.log(`${createdFamilies.length} aile eklendi`);

    // Aile kodlarını ID ile eşleştirme
    const familyCodeMap = new Map();
    createdFamilies.forEach(family => {
      familyCodeMap.set(family.code, family._id);
    });
    
    // Aile hiyerarşisini oluşturma (parent-child ilişkileri)
    await Promise.all([
      // Elektronik ana aile altına alt aileler ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('COMPUTERS'), { parent: familyCodeMap.get('ELECTRONICS') }),
      Family.findByIdAndUpdate(familyCodeMap.get('PHONES'), { parent: familyCodeMap.get('ELECTRONICS') }),
      Family.findByIdAndUpdate(familyCodeMap.get('TV_AUDIO'), { parent: familyCodeMap.get('ELECTRONICS') }),
      
      // Bilgisayar alt aileleri ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('LAPTOPS'), { parent: familyCodeMap.get('COMPUTERS') }),
      Family.findByIdAndUpdate(familyCodeMap.get('DESKTOPS'), { parent: familyCodeMap.get('COMPUTERS') }),
      Family.findByIdAndUpdate(familyCodeMap.get('TABLETS'), { parent: familyCodeMap.get('COMPUTERS') }),
      
      // Telefon alt aileleri ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('SMARTPHONES'), { parent: familyCodeMap.get('PHONES') }),
      
      // TV alt aileleri ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('TELEVISIONS'), { parent: familyCodeMap.get('TV_AUDIO') }),
      
      // Müşteri alt aileleri ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('INDIVIDUAL_CUSTOMERS'), { parent: familyCodeMap.get('CUSTOMERS') }),
      Family.findByIdAndUpdate(familyCodeMap.get('CORPORATE_CUSTOMERS'), { parent: familyCodeMap.get('CUSTOMERS') }),
      
      // Belge alt aileleri ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('ORDERS'), { parent: familyCodeMap.get('DOCUMENTS') }),
      Family.findByIdAndUpdate(familyCodeMap.get('INVOICES'), { parent: familyCodeMap.get('DOCUMENTS') }),
      
      // Tedarikçi alt aileleri ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('LOCAL_SUPPLIERS'), { parent: familyCodeMap.get('SUPPLIERS') }),
      
      // Servis alt aileleri ekleme
      Family.findByIdAndUpdate(familyCodeMap.get('WARRANTY_SERVICES'), { parent: familyCodeMap.get('SERVICES') })
    ]);
    
    console.log('Aile hiyerarşisi oluşturuldu');
    
    // Kategorilere aile referansları ekleme
    await Promise.all([
      // Elektronik ürünler kategorilerine aile referansları ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('ELECTRONIC_PRODUCTS'), { family: familyCodeMap.get('ELECTRONICS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('COMPUTERS'), { family: familyCodeMap.get('COMPUTERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('LAPTOPS'), { family: familyCodeMap.get('LAPTOPS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('DESKTOPS'), { family: familyCodeMap.get('DESKTOPS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('TABLETS'), { family: familyCodeMap.get('TABLETS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('PHONES'), { family: familyCodeMap.get('PHONES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('SMARTPHONES'), { family: familyCodeMap.get('SMARTPHONES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('CLASSIC_PHONES'), { family: familyCodeMap.get('PHONES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('TV_AUDIO'), { family: familyCodeMap.get('TV_AUDIO') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('TELEVISIONS'), { family: familyCodeMap.get('TELEVISIONS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('SOUND_SYSTEMS'), { family: familyCodeMap.get('TV_AUDIO') }),
      
      // Müşteri kategorilerine aile referansları ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('CUSTOMERS'), { family: familyCodeMap.get('CUSTOMERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('INDIVIDUAL_CUSTOMERS'), { family: familyCodeMap.get('INDIVIDUAL_CUSTOMERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('CORPORATE_CUSTOMERS'), { family: familyCodeMap.get('CORPORATE_CUSTOMERS') }),
      
      // Belge kategorilerine aile referansları ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('DOCUMENTS'), { family: familyCodeMap.get('DOCUMENTS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('ORDERS'), { family: familyCodeMap.get('ORDERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('INVOICES'), { family: familyCodeMap.get('INVOICES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('REPORTS'), { family: familyCodeMap.get('DOCUMENTS') }),
      
      // Tedarikçi kategorilerine aile referansları ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('SUPPLIERS'), { family: familyCodeMap.get('SUPPLIERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('LOCAL_SUPPLIERS'), { family: familyCodeMap.get('LOCAL_SUPPLIERS') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('FOREIGN_SUPPLIERS'), { family: familyCodeMap.get('SUPPLIERS') }),
      
      // Servis kategorilerine aile referansları ekleme
      Category.findByIdAndUpdate(categoryCodeMap.get('SERVICES'), { family: familyCodeMap.get('SERVICES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('WARRANTY_SERVICES'), { family: familyCodeMap.get('WARRANTY_SERVICES') }),
      Category.findByIdAndUpdate(categoryCodeMap.get('PAID_SERVICES'), { family: familyCodeMap.get('SERVICES') })
    ]);
    
    console.log('Kategorilere aile referansları eklendi');
    
    // 8. Ürün tiplerini oluşturma
    const itemTypes = [
      // Ana ItemType'lar - Bunlar en üst seviye grup olacak
      {
        name: 'Elektronik Ürün Yönetimi',
        code: 'ELECTRONIC_PRODUCT_MANAGEMENT',
        description: 'Elektronik ürün yönetimi',
        family: familyCodeMap.get('ELECTRONICS'),
        attributes: [
          attributeCodeMap.get('brand'),
          attributeCodeMap.get('model'),
          attributeCodeMap.get('serialNumber'),
          attributeCodeMap.get('warrantyPeriod'),
          attributeCodeMap.get('productionDate')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Temel Bilgiler'),
          attrGroupNameMap.get('Teknik Özellikler'),
          attrGroupNameMap.get('Fiziksel Özellikler')
        ],
        isActive: true
      },
      {
        name: 'Stok Yönetimi',
        code: 'INVENTORY_MANAGEMENT',
        description: 'Stok yönetimi',
        family: familyCodeMap.get('ELECTRONICS'),
        attributes: [
          attributeCodeMap.get('stockQuantity'),
          attributeCodeMap.get('minStockLevel'),
          attributeCodeMap.get('reservedStock'),
          attributeCodeMap.get('lastStockIn'),
          attributeCodeMap.get('lastStockOut'),
          attributeCodeMap.get('warehouseLocation')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Stok Bilgileri'),
          attrGroupNameMap.get('Lojistik Bilgiler')
        ],
        isActive: true
      },
      {
        name: 'Müşteri Yönetimi',
        code: 'CUSTOMER_MANAGEMENT',
        description: 'Müşteri yönetimi',
        family: familyCodeMap.get('CUSTOMERS'),
        attributes: [
          attributeCodeMap.get('customerName'),
          attributeCodeMap.get('customerSurname'),
          attributeCodeMap.get('phone'),
          attributeCodeMap.get('email'),
          attributeCodeMap.get('address'),
          attributeCodeMap.get('customerType')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Müşteri Bilgileri')
        ],
        isActive: true
      },
      {
        name: 'Satış Yönetimi',
        code: 'SALES_MANAGEMENT',
        description: 'Satış yönetimi',
        family: familyCodeMap.get('DOCUMENTS'),
        attributes: [
          attributeCodeMap.get('orderDate'),
          attributeCodeMap.get('estimatedDeliveryDate'),
          attributeCodeMap.get('orderStatus'),
          attributeCodeMap.get('paymentMethod'),
          attributeCodeMap.get('totalAmount')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Sipariş Bilgileri'),
          attrGroupNameMap.get('Fiyatlandırma')
        ],
        isActive: true
      },
      {
        name: 'Fatura Yönetimi',
        code: 'INVOICE_MANAGEMENT',
        description: 'Fatura yönetimi',
        family: familyCodeMap.get('DOCUMENTS'),
        attributes: [
          attributeCodeMap.get('invoiceNumber'),
          attributeCodeMap.get('invoiceDate'),
          attributeCodeMap.get('totalAmount'),
          attributeCodeMap.get('taxAmount'),
          attributeCodeMap.get('invoiceAddress'),
          attributeCodeMap.get('invoiceStatus')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Fatura Bilgileri'),
          attrGroupNameMap.get('Fiyatlandırma')
        ],
        isActive: true
      },
      {
        name: 'Tedarikçi Yönetimi',
        code: 'SUPPLIER_MANAGEMENT',
        description: 'Tedarikçi yönetimi',
        family: familyCodeMap.get('SUPPLIERS'),
        attributes: [
          attributeCodeMap.get('supplierName'),
          attributeCodeMap.get('supplierContactPerson'),
          attributeCodeMap.get('supplierPhone'),
          attributeCodeMap.get('supplierEmail'),
          attributeCodeMap.get('supplierAddress'),
          attributeCodeMap.get('supplierPaymentTerm')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Tedarikçi Bilgileri')
        ],
        isActive: true
      },
      {
        name: 'Servis Yönetimi',
        code: 'SERVICE_MANAGEMENT',
        description: 'Servis yönetimi',
        family: familyCodeMap.get('SERVICES'),
        attributes: [
          attributeCodeMap.get('serviceDate'),
          attributeCodeMap.get('serviceType'),
          attributeCodeMap.get('technician'),
          attributeCodeMap.get('faultDescription'),
          attributeCodeMap.get('serviceAction'),
          attributeCodeMap.get('serviceStatus'),
          attributeCodeMap.get('serviceFee')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Servis Bilgileri')
        ],
        isActive: true
      },
      
      // Elektronik Ürün Alt Türleri
      {
        name: 'Dizüstü Bilgisayar',
        code: 'LAPTOP',
        description: 'Taşınabilir bilgisayarlar',
        family: familyCodeMap.get('LAPTOPS'),
        attributes: [
          attributeCodeMap.get('brand'),
          attributeCodeMap.get('model'),
          attributeCodeMap.get('serialNumber'),
          attributeCodeMap.get('warrantyPeriod'),
          attributeCodeMap.get('productionDate'),
          attributeCodeMap.get('processor'),
          attributeCodeMap.get('ram'),
          attributeCodeMap.get('storage'),
          attributeCodeMap.get('screenSize'),
          attributeCodeMap.get('resolution'),
          attributeCodeMap.get('operatingSystem'),
          attributeCodeMap.get('color'),
          attributeCodeMap.get('weight'),
          attributeCodeMap.get('dimensions'),
          attributeCodeMap.get('material'),
          attributeCodeMap.get('stockQuantity'),
          attributeCodeMap.get('costPrice'),
          attributeCodeMap.get('sellingPrice'),
          attributeCodeMap.get('taxRate')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Temel Bilgiler'),
          attrGroupNameMap.get('Teknik Özellikler'),
          attrGroupNameMap.get('Fiziksel Özellikler'),
          attrGroupNameMap.get('Fiyatlandırma')
        ],
        isActive: true
      },
      {
        name: 'Masaüstü Bilgisayar',
        code: 'DESKTOP',
        description: 'Masaüstü bilgisayarlar',
        family: familyCodeMap.get('DESKTOPS'),
        attributes: [
          attributeCodeMap.get('brand'),
          attributeCodeMap.get('model'),
          attributeCodeMap.get('serialNumber'),
          attributeCodeMap.get('warrantyPeriod'),
          attributeCodeMap.get('productionDate'),
          attributeCodeMap.get('processor'),
          attributeCodeMap.get('ram'),
          attributeCodeMap.get('storage'),
          attributeCodeMap.get('operatingSystem'),
          attributeCodeMap.get('color'),
          attributeCodeMap.get('dimensions'),
          attributeCodeMap.get('stockQuantity'),
          attributeCodeMap.get('costPrice'),
          attributeCodeMap.get('sellingPrice'),
          attributeCodeMap.get('taxRate')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Temel Bilgiler'),
          attrGroupNameMap.get('Teknik Özellikler'),
          attrGroupNameMap.get('Fiyatlandırma')
        ],
        isActive: true
      },
      {
        name: 'Tablet',
        code: 'TABLET',
        description: 'Tablet bilgisayarlar',
        family: familyCodeMap.get('TABLETS'),
        attributes: [
          attributeCodeMap.get('brand'),
          attributeCodeMap.get('model'),
          attributeCodeMap.get('serialNumber'),
          attributeCodeMap.get('warrantyPeriod'),
          attributeCodeMap.get('productionDate'),
          attributeCodeMap.get('processor'),
          attributeCodeMap.get('ram'),
          attributeCodeMap.get('storage'),
          attributeCodeMap.get('screenSize'),
          attributeCodeMap.get('resolution'),
          attributeCodeMap.get('operatingSystem'),
          attributeCodeMap.get('color'),
          attributeCodeMap.get('weight'),
          attributeCodeMap.get('dimensions'),
          attributeCodeMap.get('stockQuantity'),
          attributeCodeMap.get('costPrice'),
          attributeCodeMap.get('sellingPrice'),
          attributeCodeMap.get('taxRate')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Temel Bilgiler'),
          attrGroupNameMap.get('Teknik Özellikler'),
          attrGroupNameMap.get('Fiziksel Özellikler'),
          attrGroupNameMap.get('Fiyatlandırma')
        ],
        isActive: true
      },
      {
        name: 'Akıllı Telefon',
        code: 'SMARTPHONE',
        description: 'Akıllı telefonlar',
        family: familyCodeMap.get('SMARTPHONES'),
        attributes: [
          attributeCodeMap.get('brand'),
          attributeCodeMap.get('model'),
          attributeCodeMap.get('serialNumber'),
          attributeCodeMap.get('warrantyPeriod'),
          attributeCodeMap.get('productionDate'),
          attributeCodeMap.get('processor'),
          attributeCodeMap.get('ram'),
          attributeCodeMap.get('storage'),
          attributeCodeMap.get('screenSize'),
          attributeCodeMap.get('resolution'),
          attributeCodeMap.get('operatingSystem'),
          attributeCodeMap.get('color'),
          attributeCodeMap.get('weight'),
          attributeCodeMap.get('dimensions'),
          attributeCodeMap.get('stockQuantity'),
          attributeCodeMap.get('costPrice'),
          attributeCodeMap.get('sellingPrice'),
          attributeCodeMap.get('taxRate')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Temel Bilgiler'),
          attrGroupNameMap.get('Teknik Özellikler'),
          attrGroupNameMap.get('Fiziksel Özellikler'),
          attrGroupNameMap.get('Fiyatlandırma')
        ],
        isActive: true
      },
      {
        name: 'Televizyon',
        code: 'TV',
        description: 'Televizyonlar',
        family: familyCodeMap.get('TELEVISIONS'),
        attributes: [
          attributeCodeMap.get('brand'),
          attributeCodeMap.get('model'),
          attributeCodeMap.get('serialNumber'),
          attributeCodeMap.get('warrantyPeriod'),
          attributeCodeMap.get('productionDate'),
          attributeCodeMap.get('screenSize'),
          attributeCodeMap.get('resolution'),
          attributeCodeMap.get('color'),
          attributeCodeMap.get('dimensions'),
          attributeCodeMap.get('stockQuantity'),
          attributeCodeMap.get('costPrice'),
          attributeCodeMap.get('sellingPrice'),
          attributeCodeMap.get('taxRate')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Temel Bilgiler'),
          attrGroupNameMap.get('Teknik Özellikler'),
          attrGroupNameMap.get('Fiyatlandırma')
        ],
        isActive: true
      },
      
      // Müşteri Alt Türleri
      {
        name: 'Bireysel Müşteri',
        code: 'INDIVIDUAL_CUSTOMER',
        description: 'Bireysel müşteri kaydı',
        family: familyCodeMap.get('INDIVIDUAL_CUSTOMERS'),
        attributes: [
          attributeCodeMap.get('customerName'),
          attributeCodeMap.get('customerSurname'),
          attributeCodeMap.get('phone'),
          attributeCodeMap.get('email'),
          attributeCodeMap.get('address'),
          attributeCodeMap.get('customerType')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Müşteri Bilgileri')
        ],
        isActive: true
      },
      {
        name: 'Kurumsal Müşteri',
        code: 'CORPORATE_CUSTOMER',
        description: 'Kurumsal müşteri kaydı',
        family: familyCodeMap.get('CORPORATE_CUSTOMERS'),
        attributes: [
          attributeCodeMap.get('customerName'),
          attributeCodeMap.get('phone'),
          attributeCodeMap.get('email'),
          attributeCodeMap.get('address'),
          attributeCodeMap.get('customerType')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Müşteri Bilgileri')
        ],
        isActive: true
      },
      
      // Belgeler Alt Türleri
      {
        name: 'Sipariş',
        code: 'ORDER',
        description: 'Müşteri siparişi',
        family: familyCodeMap.get('ORDERS'),
        attributes: [
          attributeCodeMap.get('orderDate'),
          attributeCodeMap.get('estimatedDeliveryDate'),
          attributeCodeMap.get('orderStatus'),
          attributeCodeMap.get('paymentMethod'),
          attributeCodeMap.get('shippingCompany'),
          attributeCodeMap.get('trackingNumber'),
          attributeCodeMap.get('totalAmount')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Sipariş Bilgileri')
        ],
        isActive: true
      },
      {
        name: 'Fatura',
        code: 'INVOICE',
        description: 'Satış faturası',
        family: familyCodeMap.get('INVOICES'),
        attributes: [
          attributeCodeMap.get('invoiceNumber'),
          attributeCodeMap.get('invoiceDate'),
          attributeCodeMap.get('totalAmount'),
          attributeCodeMap.get('taxAmount'),
          attributeCodeMap.get('invoiceAddress'),
          attributeCodeMap.get('invoiceStatus')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Fatura Bilgileri')
        ],
        isActive: true
      },
      
      // Tedarikçi Alt Türleri
      {
        name: 'Yerli Tedarikçi',
        code: 'LOCAL_SUPPLIER',
        description: 'Yurt içi tedarikçi',
        family: familyCodeMap.get('LOCAL_SUPPLIERS'),
        attributes: [
          attributeCodeMap.get('supplierName'),
          attributeCodeMap.get('supplierContactPerson'),
          attributeCodeMap.get('supplierPhone'),
          attributeCodeMap.get('supplierEmail'),
          attributeCodeMap.get('supplierAddress'),
          attributeCodeMap.get('supplierPaymentTerm')
        ],
        attributeGroups: [
          attrGroupNameMap.get('Tedarikçi Bilgileri')
        ],
        isActive: true
      },
      
      // Servis Alt Türleri
      {
        name: 'Garanti Servisi',
        code: 'WARRANTY_SERVICE',
        description: 'Garanti kapsamında servis kaydı',
        family: familyCodeMap.get('WARRANTY_SERVICES'),
        attributes: [
          attributeCodeMap.get('serviceDate'),
          attributeCodeMap.get('serviceType'),
          attributeCodeMap.get('technician'),
          attributeCodeMap.get('faultDescription'),
          attributeCodeMap.get('serviceAction'),
          attributeCodeMap.get('serviceStatus')
        ],
        isActive: true
      },
      {
        name: 'Ücretli Servis',
        code: 'PAID_SERVICE',
        description: 'Garanti dışı ücretli servis kaydı',
        family: familyCodeMap.get('SERVICES'),
        attributes: [
          attributeCodeMap.get('serviceDate'),
          attributeCodeMap.get('serviceType'),
          attributeCodeMap.get('technician'),
          attributeCodeMap.get('faultDescription'),
          attributeCodeMap.get('serviceAction'),
          attributeCodeMap.get('serviceStatus'),
          attributeCodeMap.get('serviceFee')
        ],
        isActive: true
      }
    ];

    // Ürün tiplerini veritabanına ekle
    const createdItemTypes = await Promise.all(
      itemTypes.map(itemType => ItemType.create(itemType))
    );

    console.log(`${createdItemTypes.length} ürün tipi eklendi`);

    // Ürün tipi kodlarını ID ile eşleştirme
    const itemTypeCodeMap = new Map();
    createdItemTypes.forEach(itemType => {
      itemTypeCodeMap.set(itemType.code, itemType._id);
    });
    
    // Veri eklemeleri burada devam edecek
    
  } catch (error) {
    console.error('Demo veri oluşturma hatası:', error);
  } finally {
    // mongoose.disconnect();
  }
}

// Programı çalıştır
seed(); 