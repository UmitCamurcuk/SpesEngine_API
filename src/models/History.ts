import mongoose, { Schema, Document } from 'mongoose';

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore'
}

export interface IHistory extends Document {
  entityId: mongoose.Types.ObjectId;
  entityType: string;
  entityName: string;
  action: ActionType;
  changes: any;
  previousData: any;
  newData: any;
  additionalInfo?: any;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const HistorySchema: Schema = new Schema({
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['attribute', 'attributeGroup', 'category', 'item', 'itemType', 'family', 'user', 'translation'],
    index: true
  },
  entityName: {
    type: String,
    required: true
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
HistorySchema.index({ createdBy: 1, createdAt: -1 });
HistorySchema.index({ createdAt: -1 });

export default mongoose.model<IHistory>('History', HistorySchema); 