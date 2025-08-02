import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationSettings {
  onUpdate?: boolean;
  onDelete?: boolean;
  onUsedInCategory?: boolean;
  onUsedInFamily?: boolean;
  onUsedInAttributeGroup?: boolean;
  onUsedInItemType?: boolean;
  onUsedInItem?: boolean;
}

export interface INotificationChannels {
  slack?: {
    enabled: boolean;
    webhook?: string;
    channel?: string;
  };
  email?: {
    enabled: boolean;
    recipients?: string[];
  };
  whatsapp?: {
    enabled: boolean;
    phoneNumbers?: string[];
  };
  teams?: {
    enabled: boolean;
    webhook?: string;
  };
}

export interface ITableColumn {
  key: string;
  title: string;
  visible: boolean;
  order: number;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface INavigationSettings {
  showInNavbar?: boolean;
  navbarLabel?: string;
  navbarIcon?: string;
  navbarOrder?: number;
  menuGroup?: string;
}

export interface IDisplaySettings {
  listTitle?: string;
  listDescription?: string;
  itemsPerPage?: number;
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
  tableColumns?: ITableColumn[];
  showAdvancedFilters?: boolean;
  showExportButton?: boolean;
  showImportButton?: boolean;
}

export interface IItemTypeSettings {
  notifications?: {
    settings?: INotificationSettings;
    channels?: INotificationChannels;
  };
  permissions?: {
    allowPublicAccess?: boolean;
    restrictedFields?: string[];
  };
  workflow?: {
    requireApproval?: boolean;
    autoPublish?: boolean;
  };
  navigation?: INavigationSettings;
  display?: IDisplaySettings;
}

// Association tanımları için interface'ler
export interface IAssociationRule {
  targetItemTypeCode: string;           // Hedef ItemType kodu (örn: "customer")
  targetItemTypeName?: string;          // Display name
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  cardinality: {
    min?: number;                       // Minimum ilişki sayısı
    max?: number;                       // Maximum ilişki sayısı (null = unlimited)
  };
  isRequired: boolean;                  // İlişki zorunlu mu?
  cascadeDelete?: boolean;              // İlgili kayıt silindiğinde ne olsun?
  displayField?: string;                // Hangi attribute gösterilsin?
  searchableFields?: string[];          // Hangi attribute'larda arama yapılsın?
  filterBy?: Record<string, any>;       // Ek filtreleme kriterleri
  validationRules?: Record<string, any>; // İlişki validation kuralları
  uiConfig?: {
    showInList?: boolean;               // Liste ekranında göster
    showInDetail?: boolean;             // Detay ekranında göster
    allowInlineCreate?: boolean;        // Inline oluşturma izni
    allowInlineEdit?: boolean;          // Inline düzenleme izni
    displayMode?: 'dropdown' | 'modal' | 'popup' | 'inline';
  };
}

export interface IItemTypeAssociations {
  // Giden ilişkiler (bu itemType'dan diğerlerine)
  outgoing?: IAssociationRule[];
  // Gelen ilişkiler (diğer itemType'lardan buna)  
  incoming?: IAssociationRule[];
}

export interface IItemType extends Document {
  name: mongoose.Types.ObjectId;
  code: string;
  description: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  attributeGroups?: mongoose.Types.ObjectId[];
  attributes?: mongoose.Types.ObjectId[];
  associations?: IItemTypeAssociations;  // YENİ: Association tanımları
  settings?: IItemTypeSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemTypeSchema: Schema = new Schema(
  {
    name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: [true, 'Öğe tipi adı zorunludur']
    },
    code: {
      type: String,
      required: [true, 'Öğe tipi kodu zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: [true, 'Öğe tipi açıklaması zorunludur']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori seçimi zorunludur']
    },
    attributeGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AttributeGroup',
        required: false
      }
    ],
    attributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute',
        required: false
      }
    ],
    settings: {
      type: {
        notifications: {
          type: {
            settings: {
              type: {
                onUpdate: { type: Boolean, default: false },
                onDelete: { type: Boolean, default: false },
                onUsedInCategory: { type: Boolean, default: false },
                onUsedInFamily: { type: Boolean, default: false },
                onUsedInAttributeGroup: { type: Boolean, default: false },
                onUsedInItemType: { type: Boolean, default: false },
                onUsedInItem: { type: Boolean, default: false }
              },
              required: false
            },
            channels: {
              type: {
                slack: {
                  type: {
                    enabled: { type: Boolean, default: false },
                    webhook: { type: String, required: false },
                    channel: { type: String, required: false }
                  },
                  required: false
                },
                email: {
                  type: {
                    enabled: { type: Boolean, default: false },
                    recipients: [{ type: String, required: false }]
                  },
                  required: false
                },
                whatsapp: {
                  type: {
                    enabled: { type: Boolean, default: false },
                    phoneNumbers: [{ type: String, required: false }]
                  },
                  required: false
                },
                teams: {
                  type: {
                    enabled: { type: Boolean, default: false },
                    webhook: { type: String, required: false }
                  },
                  required: false
                }
              },
              required: false
            }
          },
          required: false
        },
        permissions: {
          type: {
            allowPublicAccess: { type: Boolean, default: false },
            restrictedFields: [{ type: String, required: false }]
          },
          required: false
        },
        workflow: {
          type: {
            requireApproval: { type: Boolean, default: false },
            autoPublish: { type: Boolean, default: true }
          },
          required: false
        },
        navigation: {
          type: {
            showInNavbar: { type: Boolean, default: false },
            navbarLabel: { type: String, required: false },
            navbarIcon: { type: String, required: false },
            navbarOrder: { type: Number, required: false },
            menuGroup: { type: String, required: false }
          },
          required: false
        },
        display: {
          type: {
            listTitle: { type: String, required: false },
            listDescription: { type: String, required: false },
            itemsPerPage: { type: Number, required: false },
            defaultSortField: { type: String, required: false },
            defaultSortOrder: { type: String, enum: ['asc', 'desc'], required: false },
                         tableColumns: [{
               key: { type: String, required: true },
               title: { type: String, required: true },
               visible: { type: Boolean, default: true },
               order: { type: Number, required: true },
               width: { type: Number, required: false },
               sortable: { type: Boolean, default: true },
               filterable: { type: Boolean, default: true }
             }],
            showAdvancedFilters: { type: Boolean, default: false },
            showExportButton: { type: Boolean, default: false },
            showImportButton: { type: Boolean, default: false }
          },
          required: false
        }
      },
      required: false
    },
    associations: {
      type: {
        outgoing: [{
          targetItemTypeCode: { type: String, required: true },
          targetItemTypeName: { type: String, required: false },
          relationshipType: { 
            type: String, 
            enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
            required: true 
          },
          cardinality: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: null } // null = unlimited
          },
          isRequired: { type: Boolean, default: false },
          cascadeDelete: { type: Boolean, default: false },
          displayField: { type: String, required: false },
          searchableFields: [{ type: String }],
          filterBy: { type: Map, of: Schema.Types.Mixed },
          validationRules: { type: Map, of: Schema.Types.Mixed },
          uiConfig: {
            showInList: { type: Boolean, default: true },
            showInDetail: { type: Boolean, default: true },
            allowInlineCreate: { type: Boolean, default: false },
            allowInlineEdit: { type: Boolean, default: false },
            displayMode: { 
              type: String, 
              enum: ['dropdown', 'modal', 'popup', 'inline'],
              default: 'dropdown'
            }
          }
        }],
        incoming: [{
          targetItemTypeCode: { type: String, required: true },
          targetItemTypeName: { type: String, required: false },
          relationshipType: { 
            type: String, 
            enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
            required: true 
          },
          cardinality: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: null }
          },
          isRequired: { type: Boolean, default: false },
          cascadeDelete: { type: Boolean, default: false },
          displayField: { type: String, required: false },
          searchableFields: [{ type: String }],
          filterBy: { type: Map, of: Schema.Types.Mixed },
          validationRules: { type: Map, of: Schema.Types.Mixed },
          uiConfig: {
            showInList: { type: Boolean, default: true },
            showInDetail: { type: Boolean, default: true },
            allowInlineCreate: { type: Boolean, default: false },
            allowInlineEdit: { type: Boolean, default: false },
            displayMode: { 
              type: String, 
              enum: ['dropdown', 'modal', 'popup', 'inline'],
              default: 'dropdown'
            }
          }
        }]
      },
      required: false,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    // İndexleme stratejisi
    indexes: [
      { code: 1 }, // Unique code lookup
      { 'associations.outgoing.targetItemTypeCode': 1 }, // Association queries
      { 'associations.incoming.targetItemTypeCode': 1 }, // Reverse association queries
      { isActive: 1, code: 1 } // Active itemTypes
    ]
  }
);

export default mongoose.model<IItemType>('ItemType', ItemTypeSchema); 