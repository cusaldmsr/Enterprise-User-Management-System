import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPermission>('Permission', PermissionSchema);
