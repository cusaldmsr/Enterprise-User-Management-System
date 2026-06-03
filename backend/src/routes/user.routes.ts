import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardAnalytics,
  getAuditLogs,
  getRoles,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Dashboard & Audit (Admin only)
router.get('/analytics/dashboard', requirePermission('VIEW_DASHBOARD'), getDashboardAnalytics);
router.get('/audit-logs', requirePermission('VIEW_DASHBOARD'), getAuditLogs);

// Roles (for dropdowns)
router.get('/roles', getRoles);

// CRUD
router.get('/', requirePermission('VIEW_USERS'), getUsers);
router.get('/:id', requirePermission('VIEW_USERS'), getUserById);
router.post('/', requirePermission('CREATE_USER'), createUser);
router.put('/:id', requirePermission('EDIT_USER'), updateUser);
router.delete('/:id', requirePermission('DELETE_USER'), deleteUser);

export default router;
