import mongoose, { Schema, Document } from 'mongoose';

export interface IAttributeGroup extends Document {
  name: string;
  code: string;
  description: string;
  attributes: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttributeGroupSchema: Schema = new Schema(
  {
    name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: [true, 'Öznitelik adı zorunludur']
    },
    code: {
      type: String,
      required: [true, 'Öznitelik grup kodu zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Localization',
      required: false
    },
    attributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAttributeGroup>('AttributeGroup', AttributeGroupSchema); 