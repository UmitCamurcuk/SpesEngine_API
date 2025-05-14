import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  description: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'İzin adı zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'İzin açıklaması zorunludur']
    },
    code: {
      type: String,
      required: [true, 'İzin kodu zorunludur'],
      unique: true
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

export default mongoose.model<IPermission>('Permission', PermissionSchema); 