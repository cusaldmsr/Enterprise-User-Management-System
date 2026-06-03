import { Router } from 'express';
import {
  uploadProfileImage,
  uploadDocument,
  getDocuments,
} from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import {
  uploadProfileImage as profileMiddleware,
  uploadDocument as documentMiddleware,
} from '../middleware/upload';

const router = Router();

router.use(authenticate);

// Profile image upload (Cloudinary)
router.post(
  '/profile/:userId?',
  requirePermission('UPLOAD_FILES'),
  (req, res, next) => {
    profileMiddleware(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next();
    });
  },
  uploadProfileImage
);

// Document upload (AWS S3)
router.post(
  '/document',
  requirePermission('UPLOAD_FILES'),
  (req, res, next) => {
    documentMiddleware(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next();
    });
  },
  uploadDocument
);

// Get documents list
router.get('/documents', requirePermission('VIEW_USERS'), getDocuments);

export default router;
