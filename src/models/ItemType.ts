import mongoose, { Schema, Document } from 'mongoose';

export interface IItemType extends Document {
  name: string;
  code: string;
  description: string;
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