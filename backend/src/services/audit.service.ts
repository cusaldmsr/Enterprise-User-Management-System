import { Request } from 'express';
import AuditLog, { AuditAction } from '../models/AuditLog';
import { Types } from 'mongoose';

interface AuditOptions {
  userId: Types.ObjectId | string;
  action: AuditAction;
  details?: string;
  req?: Request;
}

export const createAuditLog = async (options: AuditOptions): Promise<void> => {
  try {
    await AuditLog.create({
      userId: options.userId,
      action: options.action,
      details: options.details,
      ipAddress: options.req?.ip || options.req?.socket?.remoteAddress,
      userAgent: options.req?.headers['user-agent'],
      timestamp: new Date(),
    });
  } catch (error) {
    // Audit log failure should never break the main flow
    console.error('Audit log failed:', error);
  }
};
