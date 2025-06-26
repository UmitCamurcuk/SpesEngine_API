import mongoose, { Schema, Document } from 'mongoose';

export interface IPermissionGroup extends Document {
  name: string;
  description: string;
  code: string;
  permissions: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionGroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'İzin grubu adı zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'İzin grubu açıklaması zorunludur']
    },
    code: {
      type: String,
      required: [true, 'İzin grubu kodu zorunludur'],
      unique: true
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
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

export default mongoose.model<IPermissionGroup>('PermissionGroup', PermissionGroupSchema); 