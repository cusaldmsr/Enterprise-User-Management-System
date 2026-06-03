import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { IRole } from '../models/Role';
import { IPermission } from '../models/Permission';

export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const role = req.user.role as unknown as IRole;
      if (!role || !role.permissions) {
        res.status(403).json({ success: false, message: 'No role assigned' });
        return;
      }

      const userPermissions = (role.permissions as unknown as IPermission[]).map(
        (p) => p.name
      );

      const hasPermission = permissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${permissions.join(', ')}`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'RBAC check failed' });
    }
  };
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const role = req.user.role as unknown as IRole;
    if (!role || !roles.includes(role.name)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
