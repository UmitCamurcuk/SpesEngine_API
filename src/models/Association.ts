import mongoose, { Schema, Document } from 'mongoose';

export interface IDisplayColumnConfig {
  attributeId: string;
  attributeName?: string;
  attributeCode?: string;
  displayName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  isRequired?: boolean;
  formatType?: 'text' | 'date' | 'number' | 'select' | 'table' | 'custom';
  customFormat?: string;
}

// Association filtreleme kriterleri
export interface IAssociationFilterCriteria {
  // Target ItemType'da hangi kategorilerden seçim yapılabilir?
  allowedTargetCategories?: mongoose.Types.ObjectId[];
  // Target ItemType'da hangi ailelerden seçim yapılabilir?
  allowedTargetFamilies?: mongoose.Types.ObjectId[];
  // Source ItemType'da hangi kategorilerden seçim yapılabilir?
  allowedSourceCategories?: mongoose.Types.ObjectId[];
  // Source ItemType'da hangi ailelerden seçim yapılabilir?
  allowedSourceFamilies?: mongoose.Types.ObjectId[];
  // Ek attribute filtreleri
  targetAttributeFilters?: {
    attributeCode: string;
    operator: 'equals' | 'contains' | 'in' | 'range' | 'exists';
    value: any;
    description?: string;
  }[];
  sourceAttributeFilters?: {
    attributeCode: string;
    operator: 'equals' | 'contains' | 'in' | 'range' | 'exists';
    value: any;
    description?: string;
  }[];
}

export interface IDisplayConfig {
  sourceToTarget?: {
    enabled: boolean;
    columns: IDisplayColumnConfig[];
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    pageSize?: number;
    showSearch?: boolean;
    searchableColumns?: string[];
  };
  targetToSource?: {
    enabled: boolean;
    columns: IDisplayColumnConfig[];
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    pageSize?: number;
    showSearch?: boolean;
    searchableColumns?: string[];
  };
}

export interface IAssociation extends Document {
  code: string;
  name: string | any; // Localization objesi olabilir
  description?: string | any; // Localization objesi olabilir
  isDirectional: boolean;
  relationshipType?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  allowedSourceTypes: any[]; // ObjectId array
  allowedTargetTypes: any[]; // ObjectId array
  filterCriteria?: IAssociationFilterCriteria; // YENİ: Filtreleme kriterleri
  metadata?: Record<string, any>;
  displayConfig?: IDisplayConfig;
  createdBy?: any;
  updatedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AssociationSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: Schema.Types.ObjectId,
      ref: 'Localization',
      required: true,
    },
    description: {
      type: Schema.Types.ObjectId,
      ref: 'Localization',
      required: false,
    },
    isDirectional: {
      type: Boolean,
      default: true,
    },
    relationshipType: {
      type: String,
      enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
      required: false,
    },
    allowedSourceTypes: [{
      type: Schema.Types.ObjectId,
      ref: 'ItemType',
      required: true,
    }],
    allowedTargetTypes: [{
      type: Schema.Types.ObjectId,
      ref: 'ItemType',
      required: true,
    }],
    filterCriteria: {
      allowedTargetCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
      }],
      allowedTargetFamilies: [{
        type: Schema.Types.ObjectId,
        ref: 'Family'
      }],
      allowedSourceCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
      }],
      allowedSourceFamilies: [{
        type: Schema.Types.ObjectId,
        ref: 'Family'
      }],
      targetAttributeFilters: [{
        attributeCode: { type: String, required: true },
        operator: { 
          type: String, 
          enum: ['equals', 'contains', 'in', 'range', 'exists'],
          required: true 
        },
        value: { type: Schema.Types.Mixed, required: true },
        description: { type: String }
      }],
      sourceAttributeFilters: [{
        attributeCode: { type: String, required: true },
        operator: { 
          type: String, 
          enum: ['equals', 'contains', 'in', 'range', 'exists'],
          required: true 
        },
        value: { type: Schema.Types.Mixed, required: true },
        description: { type: String }
      }]
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    displayConfig: {
      type: Schema.Types.Mixed,
      required: false,
      default: null
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAssociation>('Association', AssociationSchema); 