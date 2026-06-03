import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';
import s3Client, { S3_BUCKET } from '../config/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Document from '../models/Document';
import User from '../models/User';
import { createAuditLog } from '../services/audit.service';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

// POST /api/upload/profile
export const uploadProfileImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const userId = req.params.userId || req.user!.id;

  // Upload to Cloudinary via buffer stream
  const uploadStream = (): Promise<{ secure_url: string; public_id: string }> =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'eums/profiles',
          public_id: `user_${userId}_${Date.now()}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      );

      const readable = new Readable();
      readable.push(req.file!.buffer);
      readable.push(null);
      readable.pipe(stream);
    });

  const result = await uploadStream();

  // Update user profileImage in DB
  await User.findByIdAndUpdate(userId, { profileImage: result.secure_url });

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPLOAD_PROFILE',
    details: `Profile image updated for user: ${userId}`,
    req,
  });

  res.status(200).json({
    success: true,
    message: 'Profile image uploaded',
    data: { profileImage: result.secure_url },
  });
};

// POST /api/upload/document
export const uploadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const { originalname, buffer, mimetype, size } = req.file;
  const ext = originalname.split('.').pop()?.toLowerCase() || 'bin';
  const fileKey = `eums/documents/${uuidv4()}.${ext}`;

  // Upload to S3
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileKey,
      Body: buffer,
      ContentType: mimetype,
      ContentDisposition: `attachment; filename="${originalname}"`,
    })
  );

  // Generate a pre-signed URL (24-hour expiry)
  const signedUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: fileKey }),
    { expiresIn: 86400 }
  );

  const fileUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  // Determine file type
  const typeMap: Record<string, string> = {
    pdf: 'pdf',
    docx: 'docx',
    doc: 'docx',
    png: 'png',
    jpg: 'jpeg',
    jpeg: 'jpeg',
  };
  const fileType = (typeMap[ext] || 'other') as 'pdf' | 'docx' | 'png' | 'jpeg' | 'other';

  const doc = await Document.create({
    fileName: fileKey.split('/').pop(),
    originalName: originalname,
    fileUrl,
    fileKey,
    fileType,
    fileSize: size,
    uploadedBy: req.user!.id,
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPLOAD_DOCUMENT',
    details: `Document uploaded: ${originalname}`,
    req,
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded to S3',
    data: doc,
  });
};

// GET /api/upload/documents
export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  // Managers/users see only their own, admins see all
  const role = (req.user!.role as unknown as { name: string }).name;
  if (role !== 'ADMIN') {
    filter.uploadedBy = req.user!.id;
  }

  const [docs, total] = await Promise.all([
    Document.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Document.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    data: docs,
  });
};
