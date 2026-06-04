import mongoose, { Document, Schema, Types } from 'mongoose';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_USER'
  | 'EDIT_USER'
  | 'DELETE_USER'
  | 'PASSWORD_RESET'
  | 'UPLOAD_PROFILE'
  | 'UPLOAD_DOCUMENT';

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: AuditAction;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE_USER',
        'EDIT_USER',
        'DELETE_USER',
        'PASSWORD_RESET',
        'UPLOAD_PROFILE',
        'UPLOAD_DOCUMENT',
      ],
      required: true,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // B-Tree index: converts O(N) scan to O(log N) lookup on time-range queries
    },
  },
  { timestamps: false }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
