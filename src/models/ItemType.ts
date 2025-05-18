import mongoose, { Schema, Document } from 'mongoose';

export interface IItemType extends Document {
  name: string;
  code: string;
  description: string;
  family: mongoose.Types.ObjectId;
  attributeGroups?: mongoose.Types.ObjectId[];
  attributes: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Öğe tipi adı zorunludur'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Öğe tipi kodu zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Öğe tipi açıklaması zorunludur']
    },
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: [true, 'Aile seçimi zorunludur']
    },
    attributeGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AttributeGroup',
        required: false
      }
    ],
    attributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute',
        required: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IItemType>('ItemType', ItemTypeSchema); 