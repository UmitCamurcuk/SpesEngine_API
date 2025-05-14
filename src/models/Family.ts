import mongoose, { Schema, Document } from 'mongoose';

export interface IFamily extends Document {
  name: string;
  code: string;
  description: string;
  itemType: mongoose.Types.ObjectId;
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
      required: true
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

export default mongoose.model<IFamily>('Family', FamilySchema); 