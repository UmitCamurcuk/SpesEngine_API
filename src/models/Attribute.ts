import mongoose, { Schema, Document } from 'mongoose';

export enum AttributeType {
  // Basic (Temel) Types
  TEXT = 'text',              // string - Metin değerleri
  NUMBER = 'number',          // number - Sayısal değerler
  BOOLEAN = 'boolean',        // boolean - Doğru / yanlış
  DATE = 'date',              // date - Tarih
  DATETIME = 'datetime',      // datetime - Tarih + Saat
  TIME = 'time',              // time - Sadece saat
  
  // Enum / Seçilebilir Değerler
  SELECT = 'select',          // enum - Ön tanımlı seçeneklerden biri seçilir
  MULTISELECT = 'multiselect', // multi_enum - Çoklu seçim yapılabilir
  
  // Dosya / Medya Tipleri
  FILE = 'file',              // file - Tekli dosya yükleme
  IMAGE = 'image',            // image - Görsel yükleme
  ATTACHMENT = 'attachment',   // attachment - Birden fazla dosya
  
  // Kompozit / Gelişmiş Tipler
  OBJECT = 'object',          // object - İç içe veri nesneleri
  ARRAY = 'array',            // array - Tek tip dizi
  JSON = 'json',              // json - Serbest yapılandırılmış veri
  FORMULA = 'formula',        // formula - Dinamik hesaplama / formül
  EXPRESSION = 'expression',   // expression - Koşullu yapı, gösterim kuralları
  
  // UI / Görsel Bileşen Tipleri
  COLOR = 'color',            // color - Renk seçici
  RICH_TEXT = 'rich_text',    // rich_text - HTML destekli yazı
  RATING = 'rating',          // rating - Derecelendirme
  BARCODE = 'barcode',        // barcode - Barkod görselleştirme
  QR = 'qr',                  // qr - QR kod
  
  // Special Types
  READONLY = 'readonly'       // readonly - Sadece okunabilir (create'te set edilir)
}

// Validation tipi için interface tanımı
export interface IValidation {
  // Metin tipi için
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Sayı tipi için
  min?: number;
  max?: number;
  isInteger?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
  isZero?: boolean;
  
  // Tarih tipi için
  minDate?: Date;
  maxDate?: Date;
  
  // Select/MultiSelect için
  minSelections?: number;
  maxSelections?: number;
  
  // Dosya tipi için
  maxFileSize?: number; // byte cinsinden
  allowedExtensions?: string[]; // ['.pdf', '.docx']
  maxFiles?: number; // attachment için
  
  // Görsel tipi için
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: string; // '16:9', '1:1'
  
  // Rating için
  minRating?: number;
  maxRating?: number;
  allowHalfStars?: boolean;
  
  // Array için
  minItems?: number;
  maxItems?: number;
  itemType?: string; // array içindeki elemanların tipi
  
  // Color için
  colorFormat?: 'hex' | 'rgb' | 'hsl'; // renk formatı
  
  // Rich text için
  allowedTags?: string[]; // izin verilen HTML tagları
  maxTextLength?: number;
  
  // Formula/Expression için
  variables?: string[]; // kullanılabilir değişkenler
  functions?: string[]; // kullanılabilir fonksiyonlar
  
  // Readonly için
  defaultValue?: any; // varsayılan değer
}

// Notification ayarları için interface
export interface INotificationSettings {
  onUpdate?: boolean;      // Güncelleme bildirimi
  onDelete?: boolean;      // Silme bildirimi
  onUsedInCategory?: boolean;    // Kategori'de kullanım bildirimi
  onUsedInFamily?: boolean;      // Family'de kullanım bildirimi
  onUsedInAttributeGroup?: boolean; // Attribute Group'ta kullanım bildirimi
  onUsedInItemType?: boolean;    // Item Type'da kullanım bildirimi
  onUsedInItem?: boolean;        // Item'da kullanım bildirimi
}

// Attribute interface'i
export interface IAttribute extends Document {
  name: mongoose.Types.ObjectId; // Translation ID
  code: string;
  type: AttributeType;
  description: mongoose.Types.ObjectId; // Translation ID
  isRequired: boolean;
  options: mongoose.Types.ObjectId[]; // Artık attribute referansları
  optionType?: mongoose.Types.ObjectId; // Seçeneklerin attribute tipi
  validations?: IValidation;
  notificationSettings?: INotificationSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mixed tip kullanarak validasyon verilerini esnek bir şekilde depolama
const ValidationSchema = Schema.Types.Mixed;

const AttributeSchema: Schema = new Schema(
  {
    name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: [true, 'Öznitelik adı zorunludur']
    },
    code: {
      type: String,
      required: [true, 'Öznitelik kodu zorunludur'],
      unique: true,
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Öznitelik tipi zorunludur'],
      enum: Object.values(AttributeType),
      default: AttributeType.TEXT
    },
    description: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: false
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    options: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute',
      default: []
    }],
    optionType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute',
      required: false
    },
    validations: ValidationSchema,
    notificationSettings: {
      type: {
        onUpdate: { type: Boolean, default: false },
        onDelete: { type: Boolean, default: false },
        onUsedInCategory: { type: Boolean, default: false },
        onUsedInFamily: { type: Boolean, default: false },
        onUsedInAttributeGroup: { type: Boolean, default: false },
        onUsedInItemType: { type: Boolean, default: false },
        onUsedInItem: { type: Boolean, default: false }
      },
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook ekleyerek validasyon verilerini düzenle
AttributeSchema.pre('save', function(next) {
    
  
  // Eğer validasyonlar tanımlıysa ancak boşsa, undefined yaparak MongoDB'den kaldır
  if (this.validations && Object.keys(this.validations).length === 0) {
    
    this.validations = undefined;
  }
  
  // Validasyon işlemleri
  if (this.validations) {
    const validations = this.validations as any;
    
    // NUMBER tipi için validasyonları işle
    if (this.type === AttributeType.NUMBER) {
      
      
      if (validations.min !== undefined) validations.min = Number(validations.min);
      if (validations.max !== undefined) validations.max = Number(validations.max);
      if (validations.isInteger !== undefined) validations.isInteger = Boolean(validations.isInteger);
      if (validations.isPositive !== undefined) validations.isPositive = Boolean(validations.isPositive);
      if (validations.isNegative !== undefined) validations.isNegative = Boolean(validations.isNegative);
      if (validations.isZero !== undefined) validations.isZero = Boolean(validations.isZero);
    }
    
    // TEXT tipi için validasyonları işle
    if (this.type === AttributeType.TEXT || this.type === AttributeType.RICH_TEXT) {
      
      
      if (validations.minLength !== undefined) validations.minLength = Number(validations.minLength);
      if (validations.maxLength !== undefined) validations.maxLength = Number(validations.maxLength);
      if (validations.maxTextLength !== undefined) validations.maxTextLength = Number(validations.maxTextLength);
    }
    
    // SELECT/MULTISELECT tipi için validasyonları işle
    if (this.type === AttributeType.SELECT || this.type === AttributeType.MULTISELECT) {
      
      
      if (validations.minSelections !== undefined) validations.minSelections = Number(validations.minSelections);
      if (validations.maxSelections !== undefined) validations.maxSelections = Number(validations.maxSelections);
    }
    
    // FILE/IMAGE/ATTACHMENT tipi için validasyonları işle
    if (this.type === AttributeType.FILE || this.type === AttributeType.IMAGE || this.type === AttributeType.ATTACHMENT) {
      
      
      if (validations.maxFileSize !== undefined) validations.maxFileSize = Number(validations.maxFileSize);
      if (validations.maxFiles !== undefined) validations.maxFiles = Number(validations.maxFiles);
      if (validations.maxWidth !== undefined) validations.maxWidth = Number(validations.maxWidth);
      if (validations.maxHeight !== undefined) validations.maxHeight = Number(validations.maxHeight);
    }
    
    // ARRAY tipi için validasyonları işle
    if (this.type === AttributeType.ARRAY) {
      
      
      if (validations.minItems !== undefined) validations.minItems = Number(validations.minItems);
      if (validations.maxItems !== undefined) validations.maxItems = Number(validations.maxItems);
    }
    
    // RATING tipi için validasyonları işle
    if (this.type === AttributeType.RATING) {     
      
      if (validations.minRating !== undefined) validations.minRating = Number(validations.minRating);
      if (validations.maxRating !== undefined) validations.maxRating = Number(validations.maxRating);
      if (validations.allowHalfStars !== undefined) validations.allowHalfStars = Boolean(validations.allowHalfStars);
    }
  }
  
  next();
});

// Güncelleme operasyonları için de validasyon verilerini işlemek
// Burada updateOne, findOneAndUpdate gibi metodlar için kontrol ekliyoruz
function processValidations(update: any) {
  
  // $set operatörü ile gelen güncelleme verileri
  if (update.$set && update.$set.validations) {
    
    // Boş validasyon objesi kontrolü
    if (Object.keys(update.$set.validations).length === 0) {
      update.$set.validations = undefined;
      return;
    }
    
    // Sayı tipi kontrolü
    if (update.$set.type === AttributeType.NUMBER || 
        (update.type === AttributeType.NUMBER)) {
      const validations = update.$set.validations;
      
      // min/max sayısal değerlerin işlenmesi
      if (validations.min !== undefined) {
        validations.min = Number(validations.min);
      }
      if (validations.max !== undefined) {
        validations.max = Number(validations.max);
      }
      
      // Boolean değerlerin işlenmesi
      if (validations.isInteger !== undefined) {
        validations.isInteger = Boolean(validations.isInteger);
      }
      if (validations.isPositive !== undefined) {
        validations.isPositive = Boolean(validations.isPositive);
      }
      if (validations.isNegative !== undefined) {
        validations.isNegative = Boolean(validations.isNegative);
      }
      if (validations.isZero !== undefined) {
        validations.isZero = Boolean(validations.isZero);
      }
    }
    
    // Text tipi kontrolü
    if (update.$set.type === AttributeType.TEXT || 
        (update.type === AttributeType.TEXT)) {
      const validations = update.$set.validations;
      
      if (validations.minLength !== undefined) {
        validations.minLength = Number(validations.minLength);
      }
      if (validations.maxLength !== undefined) {
        validations.maxLength = Number(validations.maxLength);
      }
    }
    
    // Date tipi kontrolü
    if (update.$set.type === AttributeType.DATE || 
        (update.type === AttributeType.DATE)) {
      // Date validasyonları için özel işlem gerekmeyebilir
    }
    
    // Select/MultiSelect tipi kontrolü
    if ((update.$set.type === AttributeType.SELECT || update.$set.type === AttributeType.MULTISELECT) || 
        (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT)) {
      const validations = update.$set.validations;
      
      if (validations.minSelections !== undefined) {
        validations.minSelections = Number(validations.minSelections);
      }
      if (validations.maxSelections !== undefined) {
        validations.maxSelections = Number(validations.maxSelections);
      }
    }
  }
  
  // Direkt update objesinde gelen validasyon verileri
  if (update.validations) {
    
    // Boş validasyon objesi kontrolü
    if (Object.keys(update.validations).length === 0) {
      update.validations = undefined;
      return;
    }
    
    // Sayı tipi kontrolü
    if (update.type === AttributeType.NUMBER) {
      const validations = update.validations; 
      
      // min/max sayısal değerlerin işlenmesi
      if (validations.min !== undefined) {
        validations.min = Number(validations.min);
      }
      if (validations.max !== undefined) {
        validations.max = Number(validations.max);
      }
      
      // Boolean değerlerin işlenmesi
      if (validations.isInteger !== undefined) {
        validations.isInteger = Boolean(validations.isInteger);
      }
      if (validations.isPositive !== undefined) {
        validations.isPositive = Boolean(validations.isPositive);
      }
      if (validations.isNegative !== undefined) {
        validations.isNegative = Boolean(validations.isNegative);
      }
      if (validations.isZero !== undefined) {
        validations.isZero = Boolean(validations.isZero);
      }
    }
    
    // Text tipi kontrolü
    if (update.type === AttributeType.TEXT) {
      const validations = update.validations; 
      
      if (validations.minLength !== undefined) {
        validations.minLength = Number(validations.minLength);
      }
      if (validations.maxLength !== undefined) {
        validations.maxLength = Number(validations.maxLength);
      }
    }
    
    
    // Select/MultiSelect tipi kontrolü
    if (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT) {
      const validations = update.validations;
      
      if (validations.minSelections !== undefined) {
        validations.minSelections = Number(validations.minSelections);
      }
      if (validations.maxSelections !== undefined) {
        validations.maxSelections = Number(validations.maxSelections);
      }
    }
  }
}

// Update operasyonları için pre-hook
['updateOne', 'findOneAndUpdate', 'updateMany'].forEach(method => {
  AttributeSchema.pre(method as any, function(this: mongoose.Query<any, any>, next) {
    const update = this.getUpdate() as any;
    if (update) {
      processValidations(update);
    }
    next();
  });
});

export default mongoose.model<IAttribute>('Attribute', AttributeSchema); 