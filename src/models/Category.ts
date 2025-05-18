import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  code: string;
  description: string;
  family?: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  attributeGroup?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Kategori adı zorunludur'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Kategori kodu zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Kategori açıklaması zorunludur']
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
    attributeGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttributeGroup',
      default: null
    },
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