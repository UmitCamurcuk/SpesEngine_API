/**
 * Plicess Life MDM - Plise Perde İmalat Sistemi Veri Ekleme Script'i
 * 
 * Bu script, Plicess Life MDM senaryosundaki tüm verileri SpesEngine sistemine ekler.
 * Sıralama: Localizations -> AttributeGroups -> Attributes -> Categories -> Families -> ItemTypes
 */

import mongoose from 'mongoose';
import connectDB from '../config/database';
import AttributeGroup from '../models/AttributeGroup';
import Attribute, { AttributeType } from '../models/Attribute';
import Category from '../models/Category';
import Family from '../models/Family';
import ItemType from '../models/ItemType';

// Localization modelini import et
async function getLocalization() {
  return (await import('../models/Localization')).default;
}

// =====================================
// HELPER FUNCTIONS
// =====================================

async function createLocalization(trText: string, enText: string): Promise<mongoose.Types.ObjectId> {
  const Localization = await getLocalization();
  
  const localization = await Localization.create({
    key: `plicess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    namespace: 'plicess',
    translations: {
      tr: trText,
      en: enText
    }
  });
  
  return localization._id as mongoose.Types.ObjectId;
}

async function createAttributeGroup(name: string, code: string, description: string): Promise<mongoose.Types.ObjectId> {
  const nameId = await createLocalization(name, name);
  const descriptionId = await createLocalization(description, description);
  
  const attrGroup = await AttributeGroup.create({
    name: nameId,
    code: code,
    description: descriptionId,
    attributes: [],
    isActive: true
  });
  
  return attrGroup._id as mongoose.Types.ObjectId;
}

async function createAttribute(
  name: string, 
  code: string, 
  type: AttributeType, 
  description: string, 
  attributeGroupId: mongoose.Types.ObjectId,
  isRequired: boolean = false,
  options: string[] = [],
  validations: any = {}
): Promise<mongoose.Types.ObjectId> {
  
  const nameId = await createLocalization(name, name);
  const descriptionId = await createLocalization(description, description);
  
  const attribute = await Attribute.create({
    name: nameId,
    code: code,
    type: type,
    description: descriptionId,
    isRequired: isRequired,
    options: options,
    validations: Object.keys(validations).length > 0 ? validations : undefined,
    isActive: true
  });
  
  // AttributeGroup'a bu attribute'u ekle
  await AttributeGroup.findByIdAndUpdate(
    attributeGroupId,
    { $push: { attributes: attribute._id } }
  );
  
  return attribute._id as mongoose.Types.ObjectId;
}

// =====================================
// MAIN SEEDING FUNCTION
// =====================================

async function seedPlicessLifeData(): Promise<void> {
  console.log('🎯 PLICESS LIFE MDM - PLİSE PERDE İMALAT SİSTEMİ');
  console.log('📊 Veri Seeding İşlemi Başlıyor...\n');
  
  try {
    // MongoDB bağlantısı
    await connectDB();
    console.log('📡 Veritabanı bağlantısı başarılı');
    
    // Mevcut verileri temizle
    console.log('🧹 Mevcut veriler temizleniyor...');
    await AttributeGroup.deleteMany({});
    await Attribute.deleteMany({});
    await Category.deleteMany({});
    await Family.deleteMany({});
    await ItemType.deleteMany({});
    
    // 1️⃣ ATTRIBUTE GROUPS OLUŞTUR
    console.log('\n🚀 1. Attribute Groups oluşturuluyor...');
    
    // STOK Attribute Groups
    const attrGroupStockMaterial = await createAttributeGroup(
      "Malzeme Bilgileri",
      "STOCK_MATERIAL",
      "Stok malzemelerinin temel bilgileri ve özellikleri"
    );
    
    const attrGroupStockStatus = await createAttributeGroup(
      "Stok Durumu",
      "STOCK_STATUS", 
      "Mevcut stok miktarları ve durum bilgileri"
    );
    
    const attrGroupStockPricing = await createAttributeGroup(
      "Fiyat Bilgileri",
      "STOCK_PRICING",
      "Alış satış fiyatları ve maliyet bilgileri"
    );
    
    const attrGroupStockSupplier = await createAttributeGroup(
      "Tedarikçi Bilgileri",
      "STOCK_SUPPLIER",
      "Tedarikçi firma ve alış bilgileri"
    );
    
    // SİPARİŞ Attribute Groups
    const attrGroupOrderDetails = await createAttributeGroup(
      "Sipariş Detayları",
      "ORDER_DETAILS",
      "Temel sipariş bilgileri ve müşteri detayları"
    );
    
    const attrGroupOrderSpecs = await createAttributeGroup(
      "Sipariş Özellikleri",
      "ORDER_SPECS",
      "Perde ölçüleri, renk ve malzeme seçimleri"
    );
    
    const attrGroupOrderProduction = await createAttributeGroup(
      "Üretim Durumu",
      "ORDER_PRODUCTION",
      "Üretim aşamaları ve tamamlanma durumu"
    );
    
    const attrGroupOrderCalculations = await createAttributeGroup(
      "Otomatik Hesaplamalar",
      "ORDER_CALCULATIONS",
      "Malzeme miktarları ve maliyet hesaplamaları"
    );
    
    // MÜŞTERİ Attribute Groups
    const attrGroupCustomerInfo = await createAttributeGroup(
      "Müşteri Bilgileri",
      "CUSTOMER_INFO",
      "Temel müşteri kimlik ve iletişim bilgileri"
    );
    
    const attrGroupCustomerContact = await createAttributeGroup(
      "İletişim Bilgileri",
      "CUSTOMER_CONTACT",
      "Adres ve iletişim detayları"
    );
    
    const attrGroupCustomerFinancial = await createAttributeGroup(
      "Mali Bilgiler",
      "CUSTOMER_FINANCIAL",
      "Cari hesap ve ödeme bilgileri"
    );
    
    // RAPOR Attribute Groups
    const attrGroupReportInfo = await createAttributeGroup(
      "Rapor Bilgileri",
      "REPORT_INFO",
      "Rapor türü ve dönem bilgileri"
    );
    
    console.log('✅ 12 Attribute Group oluşturuldu');
    
    // 2️⃣ ATTRIBUTES OLUŞTUR
    console.log('\n🚀 2. Attributes oluşturuluyor...');
    
    // STOK Attributes - Malzeme Bilgileri
    await createAttribute(
      "Malzeme Türü",
      "MATERIAL_TYPE",
      AttributeType.SELECT,
      "Ana malzeme kategorisi",
      attrGroupStockMaterial,
      true,
      ["Perde Kumaşı", "Alüminyum", "Yapışkan Şerit", "Kuşgözü", "Kasa Kapağı", "Plastik Kilit"]
    );
    
    await createAttribute(
      "Kumaş Serisi",
      "FABRIC_SERIES",
      AttributeType.SELECT,
      "Kumaş seri adı",
      attrGroupStockMaterial,
      false,
      ["Rose", "Jakar", "Silver", "Liva", "Blackout"]
    );
    
    await createAttribute(
      "Kumaş Renk Kodu",
      "FABRIC_COLOR_CODE",
      AttributeType.SELECT,
      "Kumaş renk kodu",
      attrGroupStockMaterial,
      false,
      ["v-01", "v-02", "v-03", "v-04", "v-05", "v-06", "v-07", "v-08", "v-09", "v-10", "v-11"]
    );
    
    await createAttribute(
      "Alüminyum Rengi",
      "ALUMINUM_COLOR",
      AttributeType.SELECT,
      "Alüminyum kasa rengi",
      attrGroupStockMaterial,
      false,
      ["Krem", "Kahve", "Beyaz", "Gri", "Bronz", "Antrasit", "Siyah"]
    );
    
    await createAttribute(
      "Ürün Kodu",
      "PRODUCT_CODE",
      AttributeType.TEXT,
      "İç ürün kodu",
      attrGroupStockMaterial,
      true,
      [],
      { maxLength: 30, minLength: 3 }
    );
    
    // STOK Attributes - Stok Durumu
    await createAttribute(
      "Mevcut Miktar",
      "CURRENT_QUANTITY",
      AttributeType.NUMBER,
      "Eldeki toplam miktar",
      attrGroupStockStatus,
      true,
      [],
      { min: 0, max: 100000 }
    );
    
    await createAttribute(
      "Birim",
      "UNIT",
      AttributeType.SELECT,
      "Ölçü birimi",
      attrGroupStockStatus,
      true,
      ["Metre", "Adet", "Kilogram", "Rulo"]
    );
    
    await createAttribute(
      "Minimum Stok",
      "MINIMUM_STOCK",
      AttributeType.NUMBER,
      "Alarm seviyesi",
      attrGroupStockStatus,
      true,
      [],
      { min: 0, max: 10000 }
    );
    
    await createAttribute(
      "Son Stok Hareketi",
      "LAST_STOCK_MOVEMENT",
      AttributeType.DATETIME,
      "Son stok giriş çıkış tarihi",
      attrGroupStockStatus,
      false
    );
    
    // STOK Attributes - Fiyat Bilgileri
    await createAttribute(
      "Alış Fiyatı",
      "PURCHASE_PRICE",
      AttributeType.NUMBER,
      "Birim alış fiyatı (TL)",
      attrGroupStockPricing,
      true,
      [],
      { min: 0, max: 50000 }
    );
    
    await createAttribute(
      "Satış Fiyatı",
      "SALE_PRICE",
      AttributeType.NUMBER,
      "Birim satış fiyatı (TL)",
      attrGroupStockPricing,
      false,
      [],
      { min: 0, max: 50000 }
    );
    
    await createAttribute(
      "KDV Oranı",
      "VAT_RATE",
      AttributeType.SELECT,
      "KDV yüzdesi",
      attrGroupStockPricing,
      false,
      ["0", "1", "8", "18", "20"]
    );
    
    // STOK Attributes - Tedarikçi Bilgileri
    await createAttribute(
      "Tedarikçi Firma",
      "SUPPLIER_COMPANY",
      AttributeType.TEXT,
      "Tedarikçi firma adı",
      attrGroupStockSupplier,
      false,
      [],
      { maxLength: 100 }
    );
    
    await createAttribute(
      "Tedarikçi Kodu",
      "SUPPLIER_CODE",
      AttributeType.TEXT,
      "Tedarikçinin ürün kodu",
      attrGroupStockSupplier,
      false,
      [],
      { maxLength: 50 }
    );
    
    // SİPARİŞ Attributes - Sipariş Detayları
    await createAttribute(
      "Sipariş Numarası",
      "ORDER_NUMBER",
      AttributeType.TEXT,
      "Benzersiz sipariş numarası",
      attrGroupOrderDetails,
      true,
      [],
      { minLength: 8, maxLength: 20 }
    );
    
    await createAttribute(
      "Sipariş Tarihi",
      "ORDER_DATE",
      AttributeType.DATETIME,
      "Siparişin alındığı tarih",
      attrGroupOrderDetails,
      true
    );
    
    await createAttribute(
      "Müşteri Adı",
      "CUSTOMER_NAME",
      AttributeType.TEXT,
      "Sipariş veren müşteri",
      attrGroupOrderDetails,
      true,
      [],
      { minLength: 3, maxLength: 100 }
    );
    
    await createAttribute(
      "Müşteri Telefonu",
      "CUSTOMER_PHONE",
      AttributeType.TEXT,
      "Müşteri iletişim telefonu",
      attrGroupOrderDetails,
      true,
      [],
      { minLength: 10, maxLength: 15 }
    );
    
    // SİPARİŞ Attributes - Sipariş Özellikleri
    await createAttribute(
      "Perde Adedi",
      "CURTAIN_COUNT",
      AttributeType.NUMBER,
      "Toplam perde sayısı",
      attrGroupOrderSpecs,
      true,
      [],
      { min: 1, max: 50, isInteger: true }
    );
    
    await createAttribute(
      "Perde Ölçüleri",
      "CURTAIN_MEASUREMENTS",
      AttributeType.ARRAY,
      "Her perdenin en x boy ölçüleri",
      attrGroupOrderSpecs,
      true,
      [],
      { minItems: 1, maxItems: 50 }
    );
    
    await createAttribute(
      "Seçilen Kumaş Serisi",
      "SELECTED_FABRIC_SERIES",
      AttributeType.SELECT,
      "Müşterinin seçtiği kumaş serisi",
      attrGroupOrderSpecs,
      true,
      ["Rose", "Jakar", "Silver", "Liva", "Blackout"]
    );
    
    await createAttribute(
      "Seçilen Kumaş Rengi",
      "SELECTED_FABRIC_COLOR",
      AttributeType.SELECT,
      "Müşterinin seçtiği kumaş rengi",
      attrGroupOrderSpecs,
      true,
      ["v-01", "v-02", "v-03", "v-04", "v-05", "v-06", "v-07", "v-08", "v-09", "v-10", "v-11"]
    );
    
    await createAttribute(
      "Seçilen Kasa Rengi",
      "SELECTED_FRAME_COLOR",
      AttributeType.SELECT,
      "Müşterinin seçtiği alüminyum kasa rengi",
      attrGroupOrderSpecs,
      true,
      ["Krem", "Kahve", "Beyaz", "Gri", "Bronz", "Antrasit", "Siyah"]
    );
    
    // SİPARİŞ Attributes - Üretim Durumu
    await createAttribute(
      "Üretim Aşaması",
      "PRODUCTION_STAGE",
      AttributeType.SELECT,
      "Mevcut üretim aşaması",
      attrGroupOrderProduction,
      true,
      ["Sipariş Alındı", "Kumaş Kesildi", "Şerit Çekildi", "Delik Delindi", "Kuşgözü Çakıldı", "Kasa Kesildi", "İplendi", "Hazır", "Kargoya Verildi", "Teslim Edildi"]
    );
    
    await createAttribute(
      "Üretim Başlangıç",
      "PRODUCTION_START_DATE",
      AttributeType.DATETIME,
      "Üretimin başladığı tarih",
      attrGroupOrderProduction,
      false
    );
    
    await createAttribute(
      "Tahmini Teslim",
      "ESTIMATED_DELIVERY",
      AttributeType.DATE,
      "Tahmini teslim tarihi",
      attrGroupOrderProduction,
      false
    );
    
    // SİPARİŞ Attributes - Otomatik Hesaplamalar
    await createAttribute(
      "Toplam Kumaş İhtiyacı",
      "TOTAL_FABRIC_NEEDED",
      AttributeType.FORMULA,
      "Tüm perdeler için gereken toplam kumaş (m²)",
      attrGroupOrderCalculations,
      false,
      [],
      { 
        variables: ["en", "boy", "adet"], 
        functions: ["SUM", "MULTIPLY"],
        defaultFormula: "SUM(en * boy * adet)"
      }
    );
    
    await createAttribute(
      "Yapışkan Şerit İhtiyacı",
      "ADHESIVE_STRIP_NEEDED",
      AttributeType.FORMULA,
      "Gereken yapışkan şerit miktarı (m)",
      attrGroupOrderCalculations,
      false,
      [],
      { 
        variables: ["en", "adet"], 
        functions: ["SUM", "MULTIPLY"],
        defaultFormula: "SUM(en * 2 * adet)"
      }
    );
    
    await createAttribute(
      "Kuşgözü İhtiyacı",
      "EYELET_NEEDED",
      AttributeType.EXPRESSION,
      "Gereken kuşgözü adedi",
      attrGroupOrderCalculations,
      false,
      [],
      { 
        variables: ["boy"], 
        functions: ["IF"],
        defaultFormula: "IF(boy <= 30, 4, IF(boy <= 90, 6, 8))"
      }
    );
    
    await createAttribute(
      "Alüminyum Kasa İhtiyacı",
      "ALUMINUM_FRAME_NEEDED",
      AttributeType.FORMULA,
      "Gereken alüminyum kasa miktarı (m)",
      attrGroupOrderCalculations,
      false,
      [],
      { 
        variables: ["en", "adet"], 
        functions: ["SUM", "MULTIPLY"],
        defaultFormula: "SUM((en - 0.5) * 2 * adet)"
      }
    );
    
    await createAttribute(
      "Toplam Maliyet",
      "TOTAL_COST",
      AttributeType.FORMULA,
      "Toplam üretim maliyeti",
      attrGroupOrderCalculations,
      false,
      [],
      { 
        variables: ["kumaş_maliyeti", "alüminyum_maliyeti", "aksesuar_maliyeti"], 
        functions: ["SUM"],
        defaultFormula: "SUM(kumaş_maliyeti + alüminyum_maliyeti + aksesuar_maliyeti)"
      }
    );
    
    await createAttribute(
      "Satış Fiyatı",
      "SALES_PRICE",
      AttributeType.NUMBER,
      "Müşteriye satış fiyatı (TL)",
      attrGroupOrderCalculations,
      true,
      [],
      { min: 0, max: 100000 }
    );
    
    // MÜŞTERİ Attributes - Müşteri Bilgileri
    await createAttribute(
      "Firma/Şahıs Adı",
      "CUSTOMER_FULL_NAME",
      AttributeType.TEXT,
      "Müşteri tam adı veya firma adı",
      attrGroupCustomerInfo,
      true,
      [],
      { minLength: 3, maxLength: 100 }
    );
    
    await createAttribute(
      "Müşteri Tipi",
      "CUSTOMER_TYPE",
      AttributeType.SELECT,
      "Müşteri kategorisi",
      attrGroupCustomerInfo,
      true,
      ["Bireysel", "Kurumsal", "Bayi", "Toptan"]
    );
    
    await createAttribute(
      "Vergi No/TC",
      "TAX_NUMBER",
      AttributeType.TEXT,
      "Vergi numarası veya TC kimlik no",
      attrGroupCustomerInfo,
      false,
      [],
      { minLength: 10, maxLength: 15 }
    );
    
    // MÜŞTERİ Attributes - İletişim Bilgileri
    await createAttribute(
      "Telefon",
      "PHONE",
      AttributeType.TEXT,
      "Ana telefon numarası",
      attrGroupCustomerContact,
      true,
      [],
      { minLength: 10, maxLength: 15 }
    );
    
    await createAttribute(
      "E-posta",
      "EMAIL",
      AttributeType.TEXT,
      "E-posta adresi",
      attrGroupCustomerContact,
      false,
      [],
      { maxLength: 100 }
    );
    
    await createAttribute(
      "Adres",
      "ADDRESS",
      AttributeType.TEXT,
      "Tam adres",
      attrGroupCustomerContact,
      false,
      [],
      { maxLength: 300 }
    );
    
    // MÜŞTERİ Attributes - Mali Bilgiler
    await createAttribute(
      "Cari Bakiye",
      "CURRENT_BALANCE",
      AttributeType.NUMBER,
      "Güncel cari hesap bakiyesi (TL)",
      attrGroupCustomerFinancial,
      false,
      [],
      { min: -1000000, max: 1000000 }
    );
    
    await createAttribute(
      "Kredi Limiti",
      "CREDIT_LIMIT",
      AttributeType.NUMBER,
      "Verilecek maksimum kredi (TL)",
      attrGroupCustomerFinancial,
      false,
      [],
      { min: 0, max: 1000000 }
    );
    
    await createAttribute(
      "Son Sipariş Tarihi",
      "LAST_ORDER_DATE",
      AttributeType.DATE,
      "En son sipariş tarihi",
      attrGroupCustomerFinancial,
      false
    );
    
    console.log('✅ 35+ Attribute oluşturuldu');
    
    // 3️⃣ CATEGORIES OLUŞTUR
    console.log('\n🚀 3. Categories oluşturuluyor...');
    
    // Ana kategori
    const categoryPerdeMaterials = await Category.create({
      name: "Perde Malzemeleri",
      code: "CURTAIN_MATERIALS",
      description: "Plise perde üretiminde kullanılan tüm malzemeler",
      attributeGroups: [attrGroupStockMaterial, attrGroupStockStatus],
      isActive: true
    });
    
    // Kumaşlar kategorisi
    const categoryFabrics = await Category.create({
      name: "Kumaşlar",
      code: "FABRICS",
      description: "Perde kumaşları",
      parent: categoryPerdeMaterials._id,
      attributeGroups: [attrGroupStockPricing],
      isActive: true
    });
    
    // Kumaş serileri alt kategoriler
    const categoryRoseSeries = await Category.create({
      name: "Rose Serisi",
      code: "ROSE_SERIES",
      description: "Rose seri kumaşları",
      parent: categoryFabrics._id,
      attributeGroups: [],
      isActive: true
    });
    
    const categoryJakarSeries = await Category.create({
      name: "Jakar Serisi",
      code: "JAKAR_SERIES",
      description: "Jakar seri kumaşları",
      parent: categoryFabrics._id,
      attributeGroups: [],
      isActive: true
    });
    
    const categorySilverSeries = await Category.create({
      name: "Silver Serisi",
      code: "SILVER_SERIES",
      description: "Silver seri kumaşları",
      parent: categoryFabrics._id,
      attributeGroups: [],
      isActive: true
    });
    
    // Metal parçalar kategorisi
    const categoryMetalParts = await Category.create({
      name: "Metal Parçalar",
      code: "METAL_PARTS",
      description: "Alüminyum kasalar ve metal aksesuarlar",
      parent: categoryPerdeMaterials._id,
      attributeGroups: [attrGroupStockSupplier],
      isActive: true
    });
    
    // Diğer malzemeler kategorisi
    const categoryOtherMaterials = await Category.create({
      name: "Diğer Malzemeler",
      code: "OTHER_MATERIALS",
      description: "Yapışkan şerit, kuşgözü ve diğer aksesuarlar",
      parent: categoryPerdeMaterials._id,
      attributeGroups: [],
      isActive: true
    });
    
    console.log('✅ 7 Category oluşturuldu');
    
    // 4️⃣ FAMILIES OLUŞTUR
    console.log('\n🚀 4. Families oluşturuluyor...');
    
    // Ana aile
    const familyPlisseSystems = await Family.create({
      name: "Plise Perde Sistemleri",
      code: "PLISSE_SYSTEMS",
      description: "Plise perde üretim sistemleri",
      category: categoryPerdeMaterials._id,
      attributeGroups: [attrGroupStockMaterial],
      isActive: true
    });
    
    // Kumaş aileleri
    const familyRosePlisse = await Family.create({
      name: "Rose Plise Ailesi",
      code: "ROSE_PLISSE_FAMILY",
      description: "Rose seri kumaşlarla üretilen plise perdeler",
      parent: familyPlisseSystems._id,
      category: categoryRoseSeries._id,
      attributeGroups: [attrGroupStockPricing],
      isActive: true
    });
    
    const familyJakarPlisse = await Family.create({
      name: "Jakar Plise Ailesi",
      code: "JAKAR_PLISSE_FAMILY",
      description: "Jakar seri kumaşlarla üretilen plise perdeler",
      parent: familyPlisseSystems._id,
      category: categoryJakarSeries._id,
      attributeGroups: [attrGroupStockPricing],
      isActive: true
    });
    
    const familySilverPlisse = await Family.create({
      name: "Silver Plise Ailesi",
      code: "SILVER_PLISSE_FAMILY",
      description: "Silver seri kumaşlarla üretilen plise perdeler",
      parent: familyPlisseSystems._id,
      category: categorySilverSeries._id,
      attributeGroups: [attrGroupStockPricing],
      isActive: true
    });
    
    // Metal parçalar ailesi
    const familyAluminumParts = await Family.create({
      name: "Alüminyum Parça Ailesi",
      code: "ALUMINUM_PARTS_FAMILY",
      description: "Alüminyum kasalar ve metal aksesuarlar",
      parent: familyPlisseSystems._id,
      category: categoryMetalParts._id,
      attributeGroups: [],
      isActive: true
    });
    
    console.log('✅ 5 Family oluşturuldu');
    
    // 5️⃣ ITEM TYPES OLUŞTUR
    console.log('\n🚀 5. Item Types oluşturuluyor...');
    
    const itemTypeStock = await ItemType.create({
      name: "Stok",
      code: "STOCK",
      description: "Plise perde üretim malzemeleri stok yönetimi",
      family: familyPlisseSystems._id,
      attributeGroups: [
        attrGroupStockMaterial, 
        attrGroupStockStatus, 
        attrGroupStockPricing, 
        attrGroupStockSupplier
      ],
      attributes: [],
      isActive: true
    });
    
    const itemTypeOrders = await ItemType.create({
      name: "Siparişler",
      code: "ORDERS",
      description: "Müşteri siparişleri ve üretim takibi",
      family: familyPlisseSystems._id,
      attributeGroups: [
        attrGroupOrderDetails,
        attrGroupOrderSpecs,
        attrGroupOrderProduction,
        attrGroupOrderCalculations
      ],
      attributes: [],
      isActive: true
    });
    
    const itemTypeCustomers = await ItemType.create({
      name: "Müşteriler",
      code: "CUSTOMERS",
      description: "Müşteri bilgileri ve cari hesap yönetimi",
      family: familyPlisseSystems._id,
      attributeGroups: [
        attrGroupCustomerInfo,
        attrGroupCustomerContact,
        attrGroupCustomerFinancial
      ],
      attributes: [],
      isActive: true
    });
    
    const itemTypeReports = await ItemType.create({
      name: "Raporlar",
      code: "REPORTS",
      description: "Sistem raporları ve analizler",
      family: familyPlisseSystems._id,
      attributeGroups: [
        attrGroupReportInfo
      ],
      attributes: [],
      isActive: true
    });
    
    console.log('✅ 4 Item Type oluşturuldu');
    
    console.log('\n🎉 PLİCESS LIFE MDM SİSTEMİ SEEDING TAMAMLANDI!');
    console.log('==========================================');
    console.log('✅ Attribute Groups: 12');
    console.log('✅ Attributes: 35+');
    console.log('✅ Categories: 7 (Hiyerarşik)');
    console.log('✅ Families: 5 (Hiyerarşik)');
    console.log('✅ Item Types: 4');
    console.log('==========================================');
    console.log('📋 Sistem özellikleri:');
    console.log('• Stok takibi ve yönetimi');
    console.log('• Sipariş girişi ve üretim takibi');
    console.log('• Otomatik malzeme hesaplamaları');
    console.log('• Müşteri kayıtları ve cari takip');
    console.log('• Kapsamlı raporlama altyapısı');
    console.log('==========================================');
    
    // MongoDB bağlantısını kapat
    await mongoose.connection.close();
    console.log('📡 Veritabanı bağlantısı kapatıldı');
    
  } catch (error) {
    console.error('\n💥 SEEDING HATASI:', error);
    process.exit(1);
  }
}

// Script çalıştırma
if (require.main === module) {
  seedPlicessLifeData();
}

export { seedPlicessLifeData }; 