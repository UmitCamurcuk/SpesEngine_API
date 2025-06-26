import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: mongoose.Types.ObjectId;
  code: string;
  description: mongoose.Types.ObjectId;
  family?: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  attributeGroups?: mongoose.Types.ObjectId[];
  attributes?: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: [true, 'Öznitelik adı zorunludur']
    },
    code: {
      type: String,
      required: [true, 'Kategori kodu zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: false
    },
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: false
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    attributeGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttributeGroup',
      default: []
    }],
    attributes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attribute',
      default: []
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ICategory>('Category', CategorySchema); 