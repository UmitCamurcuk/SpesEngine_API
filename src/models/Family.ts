import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
  name: mongoose.Types.ObjectId;
  code: string;
  description?: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  subFamilies: mongoose.Types.ObjectId[]; // YENİ: Alt family'lere referanslar
  category?: mongoose.Types.ObjectId;
  itemType?: mongoose.Types.ObjectId;
  attributeGroups: mongoose.Types.ObjectId[];
  attributes: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FamilySchema = new Schema<IFamily>({
  name: {
    type: Schema.Types.ObjectId,
    ref: 'Localization',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: Schema.Types.ObjectId,
    ref: 'Localization'
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Family',
    required: false
  },
  subFamilies: [{
    type: Schema.Types.ObjectId,
    ref: 'Family'
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  itemType: {
    type: Schema.Types.ObjectId,
    ref: 'ItemType',
    required: false
  },
  attributeGroups: [{
    type: Schema.Types.ObjectId,
    ref: 'AttributeGroup'
  }],
  attributes: [{
    type: Schema.Types.ObjectId,
    ref: 'Attribute'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
FamilySchema.index({ parent: 1 });
FamilySchema.index({ category: 1 });
FamilySchema.index({ itemType: 1 });
FamilySchema.index({ code: 1 });
FamilySchema.index({ isActive: 1 });
FamilySchema.index({ parent: 1, isActive: 1 }); // Compound index for subfamily queries

export default mongoose.model<IFamily>('Family', FamilySchema); 