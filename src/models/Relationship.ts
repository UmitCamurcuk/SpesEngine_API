import mongoose, { Schema, Document } from 'mongoose';

export interface IRelationship extends Document {
  relationshipTypeId: mongoose.Types.ObjectId;
  sourceEntityId: mongoose.Types.ObjectId;
  sourceEntityType: string;
  targetEntityId: mongoose.Types.ObjectId;
  targetEntityType: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  priority?: number;
  attributes?: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipSchema: Schema = new Schema(
  {
    relationshipTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'Association',
      required: true,
    },
    sourceEntityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    sourceEntityType: {
      type: String,
      required: true,
    },
    targetEntityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetEntityType: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'archived'],
      default: 'active',
    },
    priority: {
      type: Number,
      default: 0,
    },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// İndexler
RelationshipSchema.index({ sourceEntityId: 1, sourceEntityType: 1 });
RelationshipSchema.index({ targetEntityId: 1, targetEntityType: 1 });
RelationshipSchema.index({ relationshipTypeId: 1 });
RelationshipSchema.index({ status: 1 });

export default mongoose.model<IRelationship>('Relationship', RelationshipSchema); 