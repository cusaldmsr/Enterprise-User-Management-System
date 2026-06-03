import mongoose, { Document, Schema, Types } from 'mongoose';

export type DocumentType = 'pdf' | 'docx' | 'png' | 'jpeg' | 'jpg' | 'other';

export interface IDocument extends Document {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileKey: string; // S3 object key
  fileType: DocumentType;
  fileSize: number;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileKey: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'png', 'jpeg', 'jpg', 'other'],
      default: 'other',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);
