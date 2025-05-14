import mongoose, { Schema, Document } from 'mongoose';

export interface IAttributeGroup extends Document {
  name: string;
  code: string;
  description: string;
  attributes: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttributeGroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Öznitelik grup adı zorunludur'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Öznitelik grup kodu zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Öznitelik grup açıklaması zorunludur']
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
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAttributeGroup>('AttributeGroup', AttributeGroupSchema); 