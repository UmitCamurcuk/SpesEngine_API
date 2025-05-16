import mongoose, { Schema, Document } from 'mongoose';

export interface IRelationshipType extends Document {
  code: string;
  name: string;
  description?: string;
  isDirectional: boolean;
  allowedSourceTypes: string[];
  allowedTargetTypes: string[];
  metadata?: Record<string, any>;
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
  },
  { timestamps: true }
);

export default mongoose.model<IRelationshipType>('RelationshipType', RelationshipTypeSchema); 