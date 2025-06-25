import mongoose, { Schema, Document } from 'mongoose';
import { EntityType } from './Entity';

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore',
  RELATIONSHIP_ADD = 'relationship_add',
  RELATIONSHIP_REMOVE = 'relationship_remove'
}

// Etkilenen entity bilgisi
export interface IAffectedEntity {
  entityId: mongoose.Types.ObjectId;
  entityType: EntityType;
  entityName: string;
  role: 'primary' | 'secondary'; // primary: ana entity, secondary: ilişkili entity
}

export interface IHistory extends Document {
  // Ana entity bilgisi (geriye uyumluluk için)
  entityId: mongoose.Types.ObjectId;
  entityType: EntityType;
  
  // Etkilenen tüm entity'ler (yeni sistem)
  affectedEntities: IAffectedEntity[];
  
  action: ActionType;
  changes: any;
  previousData: any;
  newData: any;
  additionalInfo?: any;
  comment?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AffectedEntitySchema = new Schema({
  entityId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: Object.values(EntityType)
  },
  entityName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['primary', 'secondary'],
    default: 'primary'
  }
}, { _id: false });

const HistorySchema: Schema = new Schema({
  // Ana entity bilgisi (geriye uyumluluk için)
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    enum: Object.values(EntityType),
    index: true
  },
  
  // Etkilenen tüm entity'ler
  affectedEntities: {
    type: [AffectedEntitySchema],
    default: []
  },
  
  action: {
    type: String,
    required: true,
    enum: Object.values(ActionType)
  },
  changes: {
    type: Schema.Types.Mixed,
    default: {}
  },
  previousData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  newData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  additionalInfo: {
    type: Schema.Types.Mixed,
    default: {}
  },
  comment: {
    type: String,
    required: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: false // Sadece createdAt gerekli
});

// Indexler
HistorySchema.index({ entityId: 1, createdAt: -1 });
HistorySchema.index({ entityType: 1, createdAt: -1 });
HistorySchema.index({ 'affectedEntities.entityId': 1, createdAt: -1 });
HistorySchema.index({ 'affectedEntities.entityType': 1, createdAt: -1 });
HistorySchema.index({ createdBy: 1, createdAt: -1 });
HistorySchema.index({ createdAt: -1 });

export default mongoose.model<IHistory>('History', HistorySchema); 