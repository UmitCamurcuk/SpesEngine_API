import mongoose, { Schema, Document } from 'mongoose';

export interface IRelationshipType extends Document {
  code: string;
  name: string | any; // Localization objesi olabilir
  description?: string | any; // Localization objesi olabilir
  isDirectional: boolean;
  relationshipType?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  allowedSourceTypes: string[];
  allowedTargetTypes: string[];
  metadata?: Record<string, any>;
  createdBy?: any;
  updatedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RelationshipTypeSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
      type: String,
      required: true,
    }],
    allowedTargetTypes: [{
      type: String,
      required: true,
    }],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
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

export default mongoose.model<IRelationshipType>('RelationshipType', RelationshipTypeSchema); 