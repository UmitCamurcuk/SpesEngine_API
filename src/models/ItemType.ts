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

export interface IItemType extends Document {
  name: mongoose.Types.ObjectId;
  code: string;
  description: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  attributeGroups?: mongoose.Types.ObjectId[];
  attributes?: mongoose.Types.ObjectId[];
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
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IItemType>('ItemType', ItemTypeSchema); 