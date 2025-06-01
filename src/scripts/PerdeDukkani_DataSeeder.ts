/**
 * Perde Dükkanı - Stok & Sipariş Yönetim Sistemi Veri Ekleme Script'i
 * 
 * Bu script, Perde Dükkanı senaryosundaki tüm verileri SpesEngine sistemine ekler.
 * Sıralama: AttributeGroups -> Attributes -> Categories -> Families -> ItemTypes
 */

import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:1903/api';

// Default admin credentials
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@spesengine.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!'
};

// API Client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface LoginResponse {
  token: string;
  user: any;
}

// Global token storage
let authToken: string | null = null;

// =====================================
// AUTHENTICATION
// =====================================

async function authenticate(): Promise<void> {
  try {
    console.log('🔐 Admin olarak giriş yapılıyor...');
    
    const response = await apiClient.post('/auth/login', ADMIN_CREDENTIALS);
    
    // Try different response formats
    let token = null;
    
    if (response.data.success && response.data.data && response.data.data.token) {
      token = response.data.data.token;
    } else if (response.data.token) {
      token = response.data.token;
    } else if (response.data.accessToken) {
      token = response.data.accessToken;
    } else if (response.data.data && response.data.data.accessToken) {
      token = response.data.data.accessToken;
    }
    
    if (token) {
      authToken = token;
      
      // Set default authorization header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      console.log('✅ Başarıyla giriş yapıldı');
    } else {
      throw new Error('Token not found in response');
    }
  } catch (error: any) {
    console.error('❌ Giriş hatası:', error.response?.data || error.message);
    throw new Error('Authentication failed. API veya credentials kontrol edin.');
  }
}

// =====================================
// 1️⃣ ATTRIBUTE GROUPS (18 Adet)
// =====================================

const attributeGroups = [
  // STOK Item Type için (5 Grup)
  {
    name: "TR: Malzeme Bilgileri | EN: Material Information",
    code: "STOCK_MATERIAL",
    description: "TR: Malzeme türü ve özellikleri | EN: Material type and properties",
    itemTypes: ["STOCK"],
    isActive: true
  },
  {
    name: "TR: Stok Durumu | EN: Stock Status", 
    code: "STOCK_STATUS",
    description: "TR: Mevcut stok miktarları | EN: Current stock quantities",
    itemTypes: ["STOCK"],
    isActive: true
  },
  {
    name: "TR: Tedarikçi Bilgileri | EN: Supplier Information",
    code: "STOCK_SUPPLIER",
    description: "TR: Tedarikçi ve alış bilgileri | EN: Supplier and purchase information",
    itemTypes: ["STOCK"],
    isActive: true
  },
  {
    name: "TR: Fiyat ve Maliyet | EN: Price & Cost",
    code: "STOCK_PRICING",
    description: "TR: Alış fiyatları ve maliyetler | EN: Purchase prices and costs",
    itemTypes: ["STOCK"],
    isActive: true
  },
  {
    name: "TR: Depo ve Konum | EN: Storage & Location",
    code: "STOCK_STORAGE",
    description: "TR: Depolama yeri ve konum bilgileri | EN: Storage location information",
    itemTypes: ["STOCK"],
    isActive: true
  },
  
  // SİPARİŞLER Item Type için (6 Grup)
  {
    name: "TR: Sipariş Detayları | EN: Order Details",
    code: "ORDER_DETAILS",
    description: "TR: Temel sipariş bilgileri | EN: Basic order information",
    itemTypes: ["ORDERS"],
    isActive: true
  },
  {
    name: "TR: Müşteri Bilgileri | EN: Customer Information",
    code: "ORDER_CUSTOMER",
    description: "TR: Sipariş veren müşteri bilgileri | EN: Customer information",
    itemTypes: ["ORDERS"],
    isActive: true
  },
  {
    name: "TR: Perde Özellikleri | EN: Curtain Specifications",
    code: "ORDER_SPECS",
    description: "TR: Plise perde ölçü ve malzeme bilgileri | EN: Plisse curtain measurements and materials",
    itemTypes: ["ORDERS"],
    isActive: true
  },
  {
    name: "TR: Otomatik Hesaplamalar | EN: Automatic Calculations",
    code: "ORDER_CALCULATIONS",
    description: "TR: Malzeme miktarları ve maliyet hesaplamaları | EN: Material quantities and cost calculations",
    itemTypes: ["ORDERS"],
    isActive: true
  },
  {
    name: "TR: Üretim Durumu | EN: Production Status",
    code: "ORDER_PRODUCTION",
    description: "TR: Üretim aşaması ve durum bilgileri | EN: Production stage and status information",
    itemTypes: ["ORDERS"],
    isActive: true
  },
  {
    name: "TR: Teslimat ve Ödeme | EN: Delivery & Payment",
    code: "ORDER_DELIVERY",
    description: "TR: Teslimat ve ödeme bilgileri | EN: Delivery and payment information",
    itemTypes: ["ORDERS"],
    isActive: true
  },
  
  // RAPORLAR Item Type için (4 Grup)
  {
    name: "TR: Rapor Bilgileri | EN: Report Information",
    code: "REPORT_INFO",
    description: "TR: Rapor türü ve genel bilgiler | EN: Report type and general information",
    itemTypes: ["REPORTS"],
    isActive: true
  },
  {
    name: "TR: Mali Veriler | EN: Financial Data",
    code: "REPORT_FINANCIAL",
    description: "TR: Gelir, gider ve kârlılık verileri | EN: Income, expense and profitability data",
    itemTypes: ["REPORTS"],
    isActive: true
  },
  {
    name: "TR: Stok Analizleri | EN: Stock Analytics",
    code: "REPORT_STOCK",
    description: "TR: Stok durum ve hareket analizleri | EN: Stock status and movement analytics",
    itemTypes: ["REPORTS"],
    isActive: true
  },
  {
    name: "TR: Müşteri Analizleri | EN: Customer Analytics",
    code: "REPORT_CUSTOMER",
    description: "TR: Müşteri davranış ve satış analizleri | EN: Customer behavior and sales analytics",
    itemTypes: ["REPORTS"],
    isActive: true
  },
  
  // MÜŞTERİLER Item Type için (3 Grup)
  {
    name: "TR: Müşteri Bilgileri | EN: Customer Information",
    code: "CUSTOMER_INFO",
    description: "TR: Temel müşteri bilgileri | EN: Basic customer information",
    itemTypes: ["CUSTOMERS"],
    isActive: true
  },
  {
    name: "TR: İletişim ve Adres | EN: Contact & Address",
    code: "CUSTOMER_CONTACT",
    description: "TR: İletişim bilgileri ve adres | EN: Contact information and address",
    itemTypes: ["CUSTOMERS"],
    isActive: true
  },
  {
    name: "TR: Sipariş Geçmişi | EN: Order History",
    code: "CUSTOMER_HISTORY",
    description: "TR: Geçmiş siparişler ve tercihler | EN: Past orders and preferences",
    itemTypes: ["CUSTOMERS"],
    isActive: true
  }
];

// =====================================
// 2️⃣ ATTRIBUTES (70+ Adet)
// =====================================

const attributes = [
  // STOK Attributes - Malzeme Bilgileri (STOCK_MATERIAL)
  {
    name: "TR: Malzeme Türü | EN: Material Type",
    code: "MATERIAL_TYPE",
    type: "select",
    description: "TR: Ana malzeme kategorisi | EN: Main material category",
    attributeGroup: "STOCK_MATERIAL",
    options: ["Kumaş", "Alüminyum Kasa", "Kuşgözü", "Yapışkan Şerit", "İp"],
    isRequired: true
  },
  {
    name: "TR: Kumaş Çeşidi | EN: Fabric Type",
    code: "FABRIC_TYPE",
    type: "select",
    description: "TR: Kumaş türü | EN: Fabric type",
    attributeGroup: "STOCK_MATERIAL",
    options: ["Rose", "Liva", "Blackout"],
    isRequired: false
  },
  {
    name: "TR: Renk | EN: Color",
    code: "COLOR",
    type: "select",
    description: "TR: Malzeme rengi | EN: Material color",
    attributeGroup: "STOCK_MATERIAL",
    options: ["Kırmızı", "Siyah", "Beyaz", "Açık Sarı", "Açık Yeşil", "Mor", "Pembe", "Kahverengi", "Bronz", "Krem"],
    isRequired: false
  },
  {
    name: "TR: Tedarikçi Kodu | EN: Supplier Code",
    code: "SUPPLIER_CODE",
    type: "text",
    description: "TR: Toptancının kullandığı kod | EN: Supplier's product code",
    attributeGroup: "STOCK_MATERIAL",
    isRequired: false,
    validations: { maxLength: 50 }
  },
  {
    name: "TR: İç Kod | EN: Internal Code",
    code: "INTERNAL_CODE",
    type: "text",
    description: "TR: Dükkanın kullandığı kod | EN: Shop's internal code",
    attributeGroup: "STOCK_MATERIAL",
    isRequired: true,
    validations: { maxLength: 30, minLength: 3 }
  },

  // STOK Attributes - Stok Durumu (STOCK_STATUS)
  {
    name: "TR: Mevcut Miktar | EN: Current Quantity",
    code: "CURRENT_QUANTITY",
    type: "number",
    description: "TR: Eldeki toplam miktar | EN: Total quantity in stock",
    attributeGroup: "STOCK_STATUS",
    isRequired: true,
    validations: { min: 0, max: 100000, step: 0.01 }
  },
  {
    name: "TR: Birim | EN: Unit",
    code: "UNIT",
    type: "select",
    description: "TR: Ölçü birimi | EN: Unit of measurement",
    attributeGroup: "STOCK_STATUS",
    options: ["Metre", "Adet", "Kilogram", "Rulo"],
    isRequired: true
  },
  {
    name: "TR: Minimum Stok | EN: Minimum Stock",
    code: "MINIMUM_STOCK",
    type: "number",
    description: "TR: Alarm seviyesi | EN: Alert level",
    attributeGroup: "STOCK_STATUS",
    isRequired: true,
    validations: { min: 0, max: 10000, step: 0.01 }
  },
  {
    name: "TR: Son Güncelleme | EN: Last Updated",
    code: "LAST_UPDATED",
    type: "datetime",
    description: "TR: Son stok güncelleme zamanı | EN: Last stock update time",
    attributeGroup: "STOCK_STATUS",
    isRequired: false
  },

  // STOK Attributes - Fiyat ve Maliyet (STOCK_PRICING)
  {
    name: "TR: Alış Fiyatı | EN: Purchase Price",
    code: "PURCHASE_PRICE",
    type: "number",
    description: "TR: Birim alış fiyatı (TL) | EN: Unit purchase price (TL)",
    attributeGroup: "STOCK_PRICING",
    isRequired: true,
    validations: { min: 0, max: 10000, step: 0.01 }
  },
  {
    name: "TR: Satış Fiyatı | EN: Sale Price",
    code: "SALE_PRICE",
    type: "number",
    description: "TR: Birim satış fiyatı (TL) | EN: Unit sale price (TL)",
    attributeGroup: "STOCK_PRICING",
    isRequired: false,
    validations: { min: 0, max: 10000, step: 0.01 }
  },
  {
    name: "TR: KDV Oranı | EN: VAT Rate",
    code: "VAT_RATE",
    type: "select",
    description: "TR: KDV yüzdesi | EN: VAT percentage",
    attributeGroup: "STOCK_PRICING",
    options: ["0", "1", "8", "18", "20"],
    isRequired: false
  },

  // SİPARİŞ Attributes - Sipariş Detayları (ORDER_DETAILS)
  {
    name: "TR: Sipariş Numarası | EN: Order Number",
    code: "ORDER_NUMBER",
    type: "text",
    description: "TR: Benzersiz sipariş numarası | EN: Unique order number",
    attributeGroup: "ORDER_DETAILS",
    isRequired: true,
    validations: { minLength: 8, maxLength: 20 }
  },
  {
    name: "TR: Sipariş Tarihi | EN: Order Date",
    code: "ORDER_DATE",
    type: "datetime",
    description: "TR: Siparişin alındığı tarih | EN: Date when order was received",
    attributeGroup: "ORDER_DETAILS",
    isRequired: true
  },
  {
    name: "TR: Sipariş Kaynağı | EN: Order Source",
    code: "ORDER_SOURCE",
    type: "select",
    description: "TR: Siparişin geldiği kanal | EN: Order channel source",
    attributeGroup: "ORDER_DETAILS",
    options: ["Katalog Perdeci", "Instagram", "Satışçı", "Çalışan Tanıdığı", "Mağaza"],
    isRequired: true
  },
  {
    name: "TR: Sipariş Durumu | EN: Order Status",
    code: "ORDER_STATUS",
    type: "select",
    description: "TR: Mevcut sipariş durumu | EN: Current order status",
    attributeGroup: "ORDER_DETAILS",
    options: ["Yeni", "Onaylandı", "Üretimde", "Hazır", "Teslim Edildi", "İptal"],
    isRequired: true
  },

  // SİPARİŞ Attributes - Perde Özellikleri (ORDER_SPECS)
  {
    name: "TR: Perde Adedi | EN: Curtain Count",
    code: "CURTAIN_COUNT",
    type: "number",
    description: "TR: Kaç adet perde sipariş edildi | EN: How many curtains ordered",
    attributeGroup: "ORDER_SPECS",
    isRequired: true,
    validations: { min: 1, max: 50, isInteger: true }
  },
  {
    name: "TR: Perde Ölçüleri | EN: Curtain Measurements",
    code: "CURTAIN_MEASUREMENTS",
    type: "array",
    description: "TR: Her perdenin genişlik x yükseklik ölçüleri | EN: Width x height measurements for each curtain",
    attributeGroup: "ORDER_SPECS",
    isRequired: true,
    validations: { minItems: 1, maxItems: 50 }
  },
  {
    name: "TR: Kumaş Seçimi | EN: Fabric Selection",
    code: "FABRIC_SELECTION",
    type: "object",
    description: "TR: Seçilen kumaş türü ve rengi | EN: Selected fabric type and color",
    attributeGroup: "ORDER_SPECS",
    isRequired: true
  },
  {
    name: "TR: Kasa Rengi | EN: Frame Color",
    code: "FRAME_COLOR",
    type: "select",
    description: "TR: Alüminyum kasa rengi | EN: Aluminum frame color",
    attributeGroup: "ORDER_SPECS",
    options: ["Beyaz", "Bronz", "Kahverengi", "Krem", "Siyah"],
    isRequired: true
  },

  // SİPARİŞ Attributes - Otomatik Hesaplamalar (ORDER_CALCULATIONS)
  {
    name: "TR: Toplam Kumaş İhtiyacı | EN: Total Fabric Needed",
    code: "TOTAL_FABRIC_NEEDED",
    type: "formula",
    description: "TR: Tüm perdeler için gereken toplam kumaş (m²) | EN: Total fabric needed for all curtains (m²)",
    attributeGroup: "ORDER_CALCULATIONS",
    isRequired: false,
    validations: { 
      variables: ["genişlik", "yükseklik", "adet"], 
      functions: ["SUM", "MULTIPLY"],
      defaultFormula: "SUM(genişlik * yükseklik * adet)",
      requireValidSyntax: true,
      allowEmptyFormula: false
    }
  },
  {
    name: "TR: Yapışkan Şerit İhtiyacı | EN: Adhesive Strip Needed",
    code: "ADHESIVE_STRIP_NEEDED",
    type: "formula",
    description: "TR: Gereken yapışkan şerit miktarı (m) | EN: Required adhesive strip amount (m)",
    attributeGroup: "ORDER_CALCULATIONS",
    isRequired: false,
    validations: { 
      variables: ["genişlik", "adet"], 
      functions: ["SUM", "MULTIPLY"],
      defaultFormula: "SUM(genişlik * 2 * adet)",
      requireValidSyntax: true,
      allowEmptyFormula: false
    }
  },
  {
    name: "TR: Kuşgözü İhtiyacı | EN: Eyelets Needed",
    code: "EYELETS_NEEDED",
    type: "expression",
    description: "TR: Gereken kuşgözü adedi | EN: Required number of eyelets",
    attributeGroup: "ORDER_CALCULATIONS",
    isRequired: false,
    validations: { 
      variables: ["genişlik"], 
      functions: ["IF", "AND", "OR"],
      defaultFormula: "IF(genişlik <= 30, 4, IF(genişlik <= 90, 6, 8))",
      requireValidSyntax: true,
      allowEmptyFormula: false
    }
  },
  {
    name: "TR: Alüminyum İhtiyacı | EN: Aluminum Needed",
    code: "ALUMINUM_NEEDED",
    type: "formula",
    description: "TR: Gereken alüminyum miktarı (m) | EN: Required aluminum amount (m)",
    attributeGroup: "ORDER_CALCULATIONS",
    isRequired: false,
    validations: { 
      variables: ["genişlik", "adet"], 
      functions: ["SUM", "MULTIPLY"],
      defaultFormula: "SUM(genişlik * 2 * adet)",
      requireValidSyntax: true,
      allowEmptyFormula: false
    }
  },
  {
    name: "TR: İp İhtiyacı | EN: String Needed",
    code: "STRING_NEEDED",
    type: "formula",
    description: "TR: Gereken ip miktarı (m) | EN: Required string amount (m)",
    attributeGroup: "ORDER_CALCULATIONS",
    isRequired: false,
    validations: { 
      variables: ["genişlik", "yükseklik", "adet"], 
      functions: ["SUM", "MULTIPLY"],
      defaultFormula: "SUM(genişlik * yükseklik * adet)",
      requireValidSyntax: true,
      allowEmptyFormula: false
    }
  },
  {
    name: "TR: Toplam Maliyet | EN: Total Cost",
    code: "TOTAL_COST",
    type: "formula",
    description: "TR: Tüm malzemelerin toplam maliyeti | EN: Total cost of all materials",
    attributeGroup: "ORDER_CALCULATIONS",
    isRequired: false,
    validations: { 
      variables: ["kumaş_maliyeti", "şerit_maliyeti", "kuşgözü_maliyeti", "alüminyum_maliyeti", "ip_maliyeti"], 
      functions: ["SUM", "ADD"],
      defaultFormula: "SUM(kumaş_maliyeti + şerit_maliyeti + kuşgözü_maliyeti + alüminyum_maliyeti + ip_maliyeti)",
      requireValidSyntax: true,
      allowEmptyFormula: false
    }
  },
  {
    name: "TR: Önerilen Satış Fiyatı | EN: Suggested Sale Price",
    code: "SUGGESTED_SALE_PRICE",
    type: "formula",
    description: "TR: %40 kâr marjı ile önerilen fiyat | EN: Suggested price with 40% profit margin",
    attributeGroup: "ORDER_CALCULATIONS",
    isRequired: false,
    validations: { 
      variables: ["toplam_maliyet", "kar_marjı"], 
      functions: ["MULTIPLY"],
      defaultFormula: "toplam_maliyet * 1.40",
      requireValidSyntax: true,
      allowEmptyFormula: false
    }
  },

  // MÜŞTERİ Attributes - Müşteri Bilgileri (CUSTOMER_INFO)
  {
    name: "TR: Ad Soyad | EN: Full Name",
    code: "FULL_NAME",
    type: "text",
    description: "TR: Müşterinin tam adı | EN: Customer's full name",
    attributeGroup: "CUSTOMER_INFO",
    isRequired: true,
    validations: { minLength: 3, maxLength: 100 }
  },
  {
    name: "TR: Telefon | EN: Phone",
    code: "PHONE",
    type: "phone",
    description: "TR: İletişim telefonu | EN: Contact phone",
    attributeGroup: "CUSTOMER_INFO",
    isRequired: true
  },
  {
    name: "TR: E-posta | EN: Email",
    code: "EMAIL",
    type: "email",
    description: "TR: E-posta adresi | EN: Email address",
    attributeGroup: "CUSTOMER_INFO",
    isRequired: false
  },
  {
    name: "TR: Müşteri Tipi | EN: Customer Type",
    code: "CUSTOMER_TYPE",
    type: "select",
    description: "TR: Müşteri kategorisi | EN: Customer category",
    attributeGroup: "CUSTOMER_INFO",
    options: ["Bireysel", "Perdeci", "Toptan", "Kurumsal"],
    isRequired: true
  }
];

// =====================================
// 3️⃣ CATEGORIES (8 Adet)
// =====================================

const categories = [
  {
    name: "TR: Perde Malzemeleri | EN: Curtain Materials",
    code: "CURTAIN_MATERIALS",
    description: "TR: Perde üretiminde kullanılan tüm malzemeler | EN: All materials used in curtain production",
    parentCategory: null,
    attributeGroups: ["STOCK_MATERIAL", "STOCK_STATUS", "STOCK_PRICING"],
    isActive: true
  },
  {
    name: "TR: Kumaşlar | EN: Fabrics",
    code: "FABRICS",
    description: "TR: Perde kumaşları | EN: Curtain fabrics",
    parentCategory: "CURTAIN_MATERIALS",
    attributeGroups: ["STOCK_STORAGE"],
    isActive: true
  },
  {
    name: "TR: Rose Kumaş | EN: Rose Fabric",
    code: "ROSE_FABRIC",
    description: "TR: Rose türü kumaşlar | EN: Rose type fabrics",
    parentCategory: "FABRICS",
    attributeGroups: [],
    isActive: true
  },
  {
    name: "TR: Liva Kumaş | EN: Liva Fabric",
    code: "LIVA_FABRIC",
    description: "TR: Liva türü kumaşlar | EN: Liva type fabrics",
    parentCategory: "FABRICS",
    attributeGroups: [],
    isActive: true
  },
  {
    name: "TR: Blackout Kumaş | EN: Blackout Fabric",
    code: "BLACKOUT_FABRIC",
    description: "TR: Blackout türü kumaşlar | EN: Blackout type fabrics",
    parentCategory: "FABRICS",
    attributeGroups: [],
    isActive: true
  },
  {
    name: "TR: Metal Aksesuarlar | EN: Metal Accessories",
    code: "METAL_ACCESSORIES",
    description: "TR: Alüminyum kasalar ve metal parçalar | EN: Aluminum frames and metal parts",
    parentCategory: "CURTAIN_MATERIALS",
    attributeGroups: ["STOCK_SUPPLIER"],
    isActive: true
  },
  {
    name: "TR: Küçük Parçalar | EN: Small Parts",
    code: "SMALL_PARTS",
    description: "TR: Kuşgözü, şerit ve diğer küçük malzemeler | EN: Eyelets, strips and other small materials",
    parentCategory: "CURTAIN_MATERIALS",
    attributeGroups: ["STOCK_STORAGE", "STOCK_SUPPLIER"],
    isActive: true
  },
  {
    name: "TR: İpler ve Bağlantı | EN: Strings & Connection",
    code: "STRINGS_CONNECTION",
    description: "TR: İp ve bağlantı elemanları | EN: Strings and connection elements",
    parentCategory: "CURTAIN_MATERIALS",
    attributeGroups: [],
    isActive: true
  }
];

// =====================================
// 4️⃣ FAMILIES (6 Adet)
// =====================================

const families = [
  {
    name: "TR: Plise Perde Sistemleri | EN: Plisse Curtain Systems",
    code: "PLISSE_SYSTEMS",
    description: "TR: Plise perde üretim sistemleri | EN: Plisse curtain production systems",
    parentFamily: null,
    attributeGroups: ["STOCK_MATERIAL", "STOCK_STATUS"],
    isActive: true
  },
  {
    name: "TR: Rose Plise Ailesi | EN: Rose Plisse Family",
    code: "ROSE_PLISSE_FAMILY",
    description: "TR: Rose kumaş ile yapılan plise perdeler | EN: Plisse curtains made with Rose fabric",
    parentFamily: "PLISSE_SYSTEMS",
    attributeGroups: ["STOCK_PRICING"],
    isActive: true
  },
  {
    name: "TR: Liva Plise Ailesi | EN: Liva Plisse Family",
    code: "LIVA_PLISSE_FAMILY",
    description: "TR: Liva kumaş ile yapılan plise perdeler | EN: Plisse curtains made with Liva fabric",
    parentFamily: "PLISSE_SYSTEMS",
    attributeGroups: ["STOCK_PRICING"],
    isActive: true
  },
  {
    name: "TR: Blackout Plise Ailesi | EN: Blackout Plisse Family",
    code: "BLACKOUT_PLISSE_FAMILY",
    description: "TR: Blackout kumaş ile yapılan plise perdeler | EN: Plisse curtains made with Blackout fabric",
    parentFamily: "PLISSE_SYSTEMS",
    attributeGroups: ["STOCK_PRICING"],
    isActive: true
  },
  {
    name: "TR: Alüminyum Kasa Aileleri | EN: Aluminum Frame Families",
    code: "ALUMINUM_FRAME_FAMILIES",
    description: "TR: Farklı renklerdeki alüminyum kasalar | EN: Aluminum frames in different colors",
    parentFamily: null,
    attributeGroups: ["STOCK_MATERIAL", "STOCK_STATUS"],
    isActive: true
  },
  {
    name: "TR: Standart Alüminyum | EN: Standard Aluminum",
    code: "STANDARD_ALUMINUM",
    description: "TR: Standart alüminyum kasa çeşitleri | EN: Standard aluminum frame varieties",
    parentFamily: "ALUMINUM_FRAME_FAMILIES",
    attributeGroups: ["STOCK_SUPPLIER"],
    isActive: true
  }
];

// =====================================
// 5️⃣ ITEM TYPES (5 Adet)
// =====================================

const itemTypes = [
  {
    name: "TR: Stok | EN: Stock",
    code: "STOCK",
    description: "TR: Perde üretim malzemeleri stoku | EN: Curtain production materials stock",
    attributeGroups: [
      "STOCK_MATERIAL", 
      "STOCK_STATUS", 
      "STOCK_SUPPLIER", 
      "STOCK_PRICING", 
      "STOCK_STORAGE"
    ],
    isActive: true
  },
  {
    name: "TR: Siparişler | EN: Orders",
    code: "ORDERS",
    description: "TR: Müşteri siparişleri | EN: Customer orders",
    attributeGroups: [
      "ORDER_DETAILS", 
      "ORDER_CUSTOMER", 
      "ORDER_SPECS", 
      "ORDER_CALCULATIONS", 
      "ORDER_PRODUCTION", 
      "ORDER_DELIVERY"
    ],
    isActive: true
  },
  {
    name: "TR: Raporlar | EN: Reports",
    code: "REPORTS",
    description: "TR: Mali ve operasyonel raporlar | EN: Financial and operational reports",
    attributeGroups: [
      "REPORT_INFO", 
      "REPORT_FINANCIAL", 
      "REPORT_STOCK", 
      "REPORT_CUSTOMER"
    ],
    isActive: true
  },
  {
    name: "TR: Müşteriler | EN: Customers",
    code: "CUSTOMERS",
    description: "TR: Müşteri bilgileri | EN: Customer information",
    attributeGroups: [
      "CUSTOMER_INFO", 
      "CUSTOMER_CONTACT", 
      "CUSTOMER_HISTORY"
    ],
    isActive: true
  },
  {
    name: "TR: Tedarikçiler | EN: Suppliers",
    code: "SUPPLIERS",
    description: "TR: Malzeme tedarikçileri | EN: Material suppliers",
    attributeGroups: [
      "STOCK_SUPPLIER", 
      "STOCK_PRICING"
    ],
    isActive: true
  }
];

// =====================================
// HELPER FUNCTIONS
// =====================================

async function makeRequest<T>(endpoint: string, data: any): Promise<T> {
  try {
    const response = await apiClient.post<ApiResponse<T>>(endpoint, data);
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Request failed');
    }
  } catch (error: any) {
    console.error(`❌ API Error for ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =====================================
// SEEDING FUNCTIONS
// =====================================

async function seedAttributeGroups(): Promise<Record<string, string>> {
  console.log('\n🚀 1. Attribute Groups ekleniyor...');
  
  const groupIdMap: Record<string, string> = {};
  
  for (const [index, group] of attributeGroups.entries()) {
    try {
      console.log(`   📝 [${index + 1}/${attributeGroups.length}] ${group.name.split('|')[0].replace('TR: ', '').trim()}`);
      
      const response = await makeRequest<any>('/attributeGroups', group);
      groupIdMap[group.code] = response._id;
      
      // API'ye yük binmemesi için kısa bekleme
      await delay(100);
    } catch (error) {
      console.error(`   ❌ Hata: ${group.code}`, error);
    }
  }
  
  console.log(`   ✅ ${Object.keys(groupIdMap).length}/${attributeGroups.length} Attribute Group başarıyla eklendi`);
  return groupIdMap;
}

async function seedAttributes(groupIdMap: Record<string, string>): Promise<Record<string, string>> {
  console.log('\n🚀 2. Attributes ekleniyor...');
  
  const attributeIdMap: Record<string, string> = {};
  
  for (const [index, attribute] of attributes.entries()) {
    try {
      console.log(`   📝 [${index + 1}/${attributes.length}] ${attribute.name.split('|')[0].replace('TR: ', '').trim()}`);
      
      // Attribute Group kodunu ID'ye çevir
      const attributeData = {
        ...attribute,
        attributeGroup: groupIdMap[attribute.attributeGroup] || attribute.attributeGroup
      };
      
      const response = await makeRequest<any>('/attributes', attributeData);
      attributeIdMap[attribute.code] = response._id;
      
      await delay(100);
    } catch (error) {
      console.error(`   ❌ Hata: ${attribute.code}`, error);
    }
  }
  
  console.log(`   ✅ ${Object.keys(attributeIdMap).length}/${attributes.length} Attribute başarıyla eklendi`);
  return attributeIdMap;
}

async function seedCategories(groupIdMap: Record<string, string>): Promise<Record<string, string>> {
  console.log('\n🚀 3. Categories ekleniyor...');
  
  const categoryIdMap: Record<string, string> = {};
  
  // Önce parent kategoriler, sonra child kategoriler
  const sortedCategories = categories.sort((a, b) => {
    if (!a.parentCategory && b.parentCategory) return -1;
    if (a.parentCategory && !b.parentCategory) return 1;
    return 0;
  });
  
  for (const [index, category] of sortedCategories.entries()) {
    try {
      console.log(`   📝 [${index + 1}/${categories.length}] ${category.name.split('|')[0].replace('TR: ', '').trim()}`);
      
      // Attribute Group kodlarını ID'lere çevir
      const categoryData = {
        ...category,
        attributeGroups: category.attributeGroups?.map(code => groupIdMap[code] || code) || [],
        parentCategory: category.parentCategory ? categoryIdMap[category.parentCategory] || category.parentCategory : null
      };
      
      const response = await makeRequest<any>('/categories', categoryData);
      categoryIdMap[category.code] = response._id;
      
      await delay(100);
    } catch (error) {
      console.error(`   ❌ Hata: ${category.code}`, error);
    }
  }
  
  console.log(`   ✅ ${Object.keys(categoryIdMap).length}/${categories.length} Category başarıyla eklendi`);
  return categoryIdMap;
}

async function seedFamilies(groupIdMap: Record<string, string>): Promise<Record<string, string>> {
  console.log('\n🚀 4. Families ekleniyor...');
  
  const familyIdMap: Record<string, string> = {};
  
  // Önce parent families, sonra child families
  const sortedFamilies = families.sort((a, b) => {
    if (!a.parentFamily && b.parentFamily) return -1;
    if (a.parentFamily && !b.parentFamily) return 1;
    return 0;
  });
  
  for (const [index, family] of sortedFamilies.entries()) {
    try {
      console.log(`   📝 [${index + 1}/${families.length}] ${family.name.split('|')[0].replace('TR: ', '').trim()}`);
      
      // Attribute Group kodlarını ID'lere çevir
      const familyData = {
        ...family,
        attributeGroups: family.attributeGroups?.map(code => groupIdMap[code] || code) || [],
        parentFamily: family.parentFamily ? familyIdMap[family.parentFamily] || family.parentFamily : null
      };
      
      const response = await makeRequest<any>('/families', familyData);
      familyIdMap[family.code] = response._id;
      
      await delay(100);
    } catch (error) {
      console.error(`   ❌ Hata: ${family.code}`, error);
    }
  }
  
  console.log(`   ✅ ${Object.keys(familyIdMap).length}/${families.length} Family başarıyla eklendi`);
  return familyIdMap;
}

async function seedItemTypes(groupIdMap: Record<string, string>): Promise<Record<string, string>> {
  console.log('\n🚀 5. Item Types ekleniyor...');
  
  const itemTypeIdMap: Record<string, string> = {};
  
  for (const [index, itemType] of itemTypes.entries()) {
    try {
      console.log(`   📝 [${index + 1}/${itemTypes.length}] ${itemType.name.split('|')[0].replace('TR: ', '').trim()}`);
      
      // Attribute Group kodlarını ID'lere çevir
      const itemTypeData = {
        ...itemType,
        attributeGroups: itemType.attributeGroups?.map(code => groupIdMap[code] || code) || []
      };
      
      const response = await makeRequest<any>('/itemTypes', itemTypeData);
      itemTypeIdMap[itemType.code] = response._id;
      
      await delay(100);
    } catch (error) {
      console.error(`   ❌ Hata: ${itemType.code}`, error);
    }
  }
  
  console.log(`   ✅ ${Object.keys(itemTypeIdMap).length}/${itemTypes.length} Item Type başarıyla eklendi`);
  return itemTypeIdMap;
}

// =====================================
// MAIN SEEDING FUNCTION
// =====================================

async function seedPerdeDukkaniData(): Promise<void> {
  console.log('🎯 PERDE DÜKKANŞ - STOK & SİPARİŞ YÖNETİM SİSTEMİ');
  console.log('📊 Veri Seeding İşlemi Başlıyor...\n');
  
  try {
    // 0. Authentication
    await authenticate();
    
    // 1. Attribute Groups
    const groupIdMap = await seedAttributeGroups();
    
    // 2. Attributes  
    const attributeIdMap = await seedAttributes(groupIdMap);
    
    // 3. Categories
    const categoryIdMap = await seedCategories(groupIdMap);
    
    // 4. Families
    const familyIdMap = await seedFamilies(groupIdMap);
    
    // 5. Item Types
    const itemTypeIdMap = await seedItemTypes(groupIdMap);
    
    console.log('\n🎉 SEEDING TAMAMLANDI!');
    console.log('==========================================');
    console.log(`✅ Attribute Groups: ${Object.keys(groupIdMap).length}`);
    console.log(`✅ Attributes: ${Object.keys(attributeIdMap).length}`);
    console.log(`✅ Categories: ${Object.keys(categoryIdMap).length}`);
    console.log(`✅ Families: ${Object.keys(familyIdMap).length}`);
    console.log(`✅ Item Types: ${Object.keys(itemTypeIdMap).length}`);
    console.log('==========================================');
    
  } catch (error) {
    console.error('\n💥 SEEDING HATASI:', error);
    process.exit(1);
  }
}

// Script çalıştırma
if (require.main === module) {
  seedPerdeDukkaniData();
}

export { seedPerdeDukkaniData }; 