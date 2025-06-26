import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissionGroups: Array<{
    permissionGroup: mongoose.Types.ObjectId;
    permissions: Array<{
      permission: mongoose.Types.ObjectId;
      granted: boolean;
    }>;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Rol adı zorunludur'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Rol açıklaması zorunludur']
    },
    permissionGroups: [
      {
        permissionGroup: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'PermissionGroup',
          required: true
        },
        permissions: [
          {
            permission: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Permission',
              required: true
            },
            granted: {
              type: Boolean,
              default: true
            }
          }
        ]
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

export default mongoose.model<IRole>('Role', RoleSchema); 