import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
  name: string;
  code: string;
  description: string;
  itemType?: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  attributeGroups?: mongoose.Types.ObjectId[];
  attributes?: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FamilySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Aile adı zorunludur'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Aile kodu zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Aile açıklaması zorunludur']
    },
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemType',
      required: false
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori seçimi zorunludur']
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: false
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
        required: false
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

export default mongoose.model<IFamily>('Family', FamilySchema); 