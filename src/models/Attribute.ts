import mongoose, { Schema, Document } from 'mongoose';

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect'
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
}

// Attribute interface'i
export interface IAttribute extends Document {
  name: string;
  code: string;
  type: AttributeType;
  description: string;
  isRequired: boolean;
  options: string[];
  attributeGroup?: mongoose.Types.ObjectId;
  validations?: IValidation;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mixed tip kullanarak validasyon verilerini esnek bir şekilde depolama
const ValidationSchema = Schema.Types.Mixed;

const AttributeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Öznitelik adı zorunludur'],
      unique: true,
      trim: true
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
      type: String,
      required: false
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    options: {
      type: [String],
      default: []
    },
    attributeGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttributeGroup',
      required: false
    },
    validations: ValidationSchema,
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
  console.log('[Attribute Model] pre-save hook çalıştı');
  console.log('[Attribute Model] validations:', this.validations);
  
  // Eğer validasyonlar tanımlıysa ancak boşsa, undefined yaparak MongoDB'den kaldır
  if (this.validations && Object.keys(this.validations).length === 0) {
    console.log('[Attribute Model] Boş validasyon objesi undefined yapılıyor');
    this.validations = undefined;
  }
  
  // TCKNO gibi büyük sayılar için validasyonu doğrula
  if (this.validations && this.type === AttributeType.NUMBER) {
    const validations = this.validations as any;
    console.log('[Attribute Model] Sayısal tip için validasyonlar işleniyor:', validations);
    
    // min ve max değerleri varsa, sayısal tipe dönüştür (Number tipinde olduğundan emin ol)
    if (validations.min !== undefined) {
      validations.min = Number(validations.min);
    }
    if (validations.max !== undefined) {
      validations.max = Number(validations.max);
    }
    
    // Boolean değerlerini doğru şekilde dönüştür
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
  
  // Text tipi için validasyonları işle
  if (this.validations && this.type === AttributeType.TEXT) {
    const validations = this.validations as any;
    console.log('[Attribute Model] Text tipi için validasyonlar işleniyor:', validations);
    
    if (validations.minLength !== undefined) {
      validations.minLength = Number(validations.minLength);
    }
    if (validations.maxLength !== undefined) {
      validations.maxLength = Number(validations.maxLength);
    }
  }
  
  // Select/MultiSelect tipi için validasyonları işle
  if (this.validations && (this.type === AttributeType.SELECT || this.type === AttributeType.MULTISELECT)) {
    const validations = this.validations as any;
    console.log('[Attribute Model] Select/MultiSelect tipi için validasyonlar işleniyor:', validations);
    
    if (validations.minSelections !== undefined) {
      validations.minSelections = Number(validations.minSelections);
    }
    if (validations.maxSelections !== undefined) {
      validations.maxSelections = Number(validations.maxSelections);
    }
  }
  
  next();
});

// Güncelleme operasyonları için de validasyon verilerini işlemek
// Burada updateOne, findOneAndUpdate gibi metodlar için kontrol ekliyoruz
function processValidations(update: any) {
  console.log('[Attribute Model] processValidations çağrıldı, update:', JSON.stringify(update, null, 2));
  
  // $set operatörü ile gelen güncelleme verileri
  if (update.$set && update.$set.validations) {
    console.log('[Attribute Model] $set.validations işleniyor:', JSON.stringify(update.$set.validations, null, 2));
    
    // Boş validasyon objesi kontrolü
    if (Object.keys(update.$set.validations).length === 0) {
      console.log('[Attribute Model] Boş $set.validations objesi undefined yapılıyor');
      update.$set.validations = undefined;
      return;
    }
    
    // Sayı tipi kontrolü
    if (update.$set.type === AttributeType.NUMBER || 
        (update.type === AttributeType.NUMBER)) {
      const validations = update.$set.validations;
      console.log('[Attribute Model] Sayısal tip için $set.validations işleniyor');
      
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
      console.log('[Attribute Model] Text tipi için $set.validations işleniyor');
      
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
      console.log('[Attribute Model] Date tipi için $set.validations işleniyor');
    }
    
    // Select/MultiSelect tipi kontrolü
    if ((update.$set.type === AttributeType.SELECT || update.$set.type === AttributeType.MULTISELECT) || 
        (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT)) {
      const validations = update.$set.validations;
      console.log('[Attribute Model] Select/MultiSelect tipi için $set.validations işleniyor');
      
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
    console.log('[Attribute Model] update.validations işleniyor:', JSON.stringify(update.validations, null, 2));
    
    // Boş validasyon objesi kontrolü
    if (Object.keys(update.validations).length === 0) {
      console.log('[Attribute Model] Boş update.validations objesi undefined yapılıyor');
      update.validations = undefined;
      return;
    }
    
    // Sayı tipi kontrolü
    if (update.type === AttributeType.NUMBER) {
      const validations = update.validations;
      console.log('[Attribute Model] Sayısal tip için update.validations işleniyor');
      
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
      console.log('[Attribute Model] Text tipi için update.validations işleniyor');
      
      if (validations.minLength !== undefined) {
        validations.minLength = Number(validations.minLength);
      }
      if (validations.maxLength !== undefined) {
        validations.maxLength = Number(validations.maxLength);
      }
    }
    
    // Date tipi kontrolü
    if (update.type === AttributeType.DATE) {
      // Date validasyonları için özel işlem gerekmeyebilir
      console.log('[Attribute Model] Date tipi için update.validations işleniyor');
    }
    
    // Select/MultiSelect tipi kontrolü
    if (update.type === AttributeType.SELECT || update.type === AttributeType.MULTISELECT) {
      const validations = update.validations;
      console.log('[Attribute Model] Select/MultiSelect tipi için update.validations işleniyor');
      
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