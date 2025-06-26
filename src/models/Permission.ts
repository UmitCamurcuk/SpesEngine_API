import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: {
    tr: string;
    en: string;
  };
  description: {
    tr: string;
    en: string;
  };
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema = new Schema(
  {
    name: {
      tr: {
        type: String,
        required: [true, 'Türkçe izin adı zorunludur'],
        trim: true
      },
      en: {
        type: String,
        required: [true, 'İngilizce izin adı zorunludur'],
        trim: true
      }
    },
    description: {
      tr: {
        type: String,
        required: [true, 'Türkçe izin açıklaması zorunludur']
      },
      en: {
        type: String,
        required: [true, 'İngilizce izin açıklaması zorunludur']
      }
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