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
  metadata?: Record<string, any>;
  displayConfig?: IDisplayConfig; // YENİ ALAN
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