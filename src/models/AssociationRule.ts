import mongoose, { Schema, Document } from 'mongoose';

// Filtreleme kriterleri için interface
export interface IFilterCriteria {
  categories?: mongoose.Types.ObjectId[];     // İzin verilen kategori ID'leri
  families?: mongoose.Types.ObjectId[];       // İzin verilen aile ID'leri
  attributeFilters?: {                        // Attribute bazlı filtreler
    attributeCode: string;
    operator: 'equals' | 'contains' | 'in' | 'range' | 'exists';
    value: any;
  }[];
  itemTypeFilters?: {                         // İlişkili ItemType filtreler
    itemTypeCode: string;
    required: boolean;
  }[];
  customQuery?: Record<string, any>;          // MongoDB query objesi
}

// UI konfigürasyonu için interface
export interface IAssociationUIConfig {
  displayMode: 'dropdown' | 'modal' | 'popup' | 'table' | 'cards';
  allowMultiSelect?: boolean;
  allowInlineCreate?: boolean;
  allowInlineEdit?: boolean;
  showInList?: boolean;
  showInDetail?: boolean;
  showSearchBox?: boolean;
  showFilters?: boolean;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  displayColumns?: {
    attributeCode: string;
    displayName: string;
    width?: number;
    sortable?: boolean;
  }[];
}

// Validation kuralları için interface
export interface IValidationRule {
  type: 'required' | 'minCount' | 'maxCount' | 'unique' | 'custom';
  value?: any;
  message?: string;
  customValidator?: string; // Function name for custom validation
}

// Association kuralı ana interface
export interface IAssociationRule extends Document {
  code: string;                               // Benzersiz kural kodu
  name: mongoose.Types.ObjectId;              // Localization referansı
  description?: mongoose.Types.ObjectId;      // Localization referansı
  
  // Association referansı
  associationId: mongoose.Types.ObjectId;     // Hangi association'a ait
  
  // ItemType'lar arası ilişki
  sourceItemTypeId: mongoose.Types.ObjectId; // Kaynak ItemType
  targetItemTypeId: mongoose.Types.ObjectId; // Hedef ItemType
  
  // İlişki türü
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  
  // Filtreleme kriterleri
  filterCriteria?: IFilterCriteria;
  
  // Validation kuralları
  validationRules: IValidationRule[];
  
  // UI konfigürasyonu
  uiConfig: IAssociationUIConfig;
  
  // Metadata
  priority?: number;                          // Sıralama için öncelik
  isActive: boolean;
  isRequired: boolean;
  cascadeDelete?: boolean;
  
  // Audit fields
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssociationRuleSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Kural kodu zorunludur'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: [true, 'Kural adı zorunludur']
    },
    description: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: false
    },
    associationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Association',
      required: [true, 'Association referansı zorunludur']
    },
    sourceItemTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemType',
      required: [true, 'Kaynak ItemType zorunludur']
    },
    targetItemTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemType',
      required: [true, 'Hedef ItemType zorunludur']
    },
    relationshipType: {
      type: String,
      enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
      required: [true, 'İlişki türü zorunludur']
    },
    filterCriteria: {
      categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }],
      families: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family'
      }],
      attributeFilters: [{
        attributeCode: {
          type: String,
          required: true
        },
        operator: {
          type: String,
          enum: ['equals', 'contains', 'in', 'range', 'exists'],
          required: true
        },
        value: {
          type: Schema.Types.Mixed,
          required: true
        }
      }],
      itemTypeFilters: [{
        itemTypeCode: {
          type: String,
          required: true
        },
        required: {
          type: Boolean,
          default: false
        }
      }],
      customQuery: {
        type: Schema.Types.Mixed
      }
    },
    validationRules: [{
      type: {
        type: String,
        enum: ['required', 'minCount', 'maxCount', 'unique', 'custom'],
        required: true
      },
      value: {
        type: Schema.Types.Mixed
      },
      message: {
        type: String
      },
      customValidator: {
        type: String
      }
    }],
    uiConfig: {
      displayMode: {
        type: String,
        enum: ['dropdown', 'modal', 'popup', 'table', 'cards'],
        default: 'dropdown'
      },
      allowMultiSelect: {
        type: Boolean,
        default: true
      },
      allowInlineCreate: {
        type: Boolean,
        default: false
      },
      allowInlineEdit: {
        type: Boolean,
        default: false
      },
      showInList: {
        type: Boolean,
        default: true
      },
      showInDetail: {
        type: Boolean,
        default: true
      },
      showSearchBox: {
        type: Boolean,
        default: true
      },
      showFilters: {
        type: Boolean,
        default: true
      },
      pageSize: {
        type: Number,
        default: 10
      },
      sortBy: {
        type: String,
        default: 'name'
      },
      sortOrder: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'asc'
      },
      displayColumns: [{
        attributeCode: {
          type: String,
          required: true
        },
        displayName: {
          type: String,
          required: true
        },
        width: {
          type: Number
        },
        sortable: {
          type: Boolean,
          default: true
        }
      }]
    },
    priority: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    cascadeDelete: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Oluşturan kullanıcı belirtilmelidir']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Güncelleyen kullanıcı belirtilmelidir']
    }
  },
  {
    timestamps: true,
    // İndexleme stratejisi
    indexes: [
      { code: 1 }, // Unique code lookup
      { associationId: 1 }, // Association'a göre kurallar
      { sourceItemTypeId: 1 }, // Source ItemType'a göre kurallar
      { targetItemTypeId: 1 }, // Target ItemType'a göre kurallar
      { isActive: 1 }, // Aktif kurallar
      { sourceItemTypeId: 1, targetItemTypeId: 1 }, // Compound index
      { priority: -1, isActive: 1 } // Öncelik sırasına göre aktif kurallar
    ]
  }
);

// Compound unique index - aynı association'da aynı source-target çifti için tek kural
AssociationRuleSchema.index(
  { associationId: 1, sourceItemTypeId: 1, targetItemTypeId: 1 }, 
  { unique: true }
);

export default mongoose.model<IAssociationRule>('AssociationRule', AssociationRuleSchema);
