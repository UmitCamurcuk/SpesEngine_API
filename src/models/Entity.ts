import mongoose, { Schema, Document } from 'mongoose';

export enum EntityType {
  ATTRIBUTE = 'attribute',
  ATTRIBUTE_GROUP = 'attributeGroup',
  CATEGORY = 'category',
  FAMILY = 'family',
  ITEM_TYPE = 'itemType',
  ITEM = 'item',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  PERMISSION_GROUP = 'permissionGroup',
  RELATIONSHIP = 'relationship',
  RELATIONSHIP_TYPE = 'relationshipType'
}

export interface IEntity extends Document {
  entityId: mongoose.Types.ObjectId; // Gerçek entity'nin ID'si
  entityType: EntityType;
  entityName: string; // İnsan tarafından okunabilir isim
  entityCode?: string; // Varsa entity'nin kodu
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EntitySchema: Schema = new Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      required: true,
      enum: Object.values(EntityType),
      index: true
    },
    entityName: {
      type: String,
      required: true,
      trim: true
    },
    entityCode: {
      type: String,
      trim: true,
      sparse: true // Boş değerlere izin ver ama unique olsun
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index - aynı entity'nin birden fazla kaydı olmasın
EntitySchema.index({ entityId: 1, entityType: 1 }, { unique: true });

export default mongoose.model<IEntity>('Entity', EntitySchema); 