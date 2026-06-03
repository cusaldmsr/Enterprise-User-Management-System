import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Role from '../models/Role';
import AuditLog from '../models/AuditLog';
import Notification from '../models/Notification';
import {
  sendWelcomeEmail,
  sendPasswordResetAlert,
  sendAccountDeletionAlert,
} from '../services/email.service';
import { createAuditLog } from '../services/audit.service';

// GET /api/users
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const search = req.query.search as string;
  const roleFilter = req.query.role as string;
  const isActive = req.query.isActive as string;

  // Build filter
  const filter: Record<string, unknown> = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (roleFilter) {
    const role = await Role.findOne({ name: roleFilter.toUpperCase() });
    if (role) filter.role = role._id;
  }

  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true';
  }

  const [users, totalRecords] = await Promise.all([
    User.find(filter)
      .populate({ path: 'role', populate: { path: 'permissions' } })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    success: true,
    meta: { totalRecords, totalPages, currentPage: page, limit },
    data: users,
  });
};

// GET /api/users/:id
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).populate({
    path: 'role',
    populate: { path: 'permissions' },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.status(200).json({ success: true, data: user });
};

// POST /api/users
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, roleId, isActive } = req.body;

  if (!firstName || !lastName || !email || !password || !roleId) {
    res.status(400).json({ success: false, message: 'Missing required fields' });
    return;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'Email already registered' });
    return;
  }

  const role = await Role.findById(roleId);
  if (!role) {
    res.status(400).json({ success: false, message: 'Invalid role' });
    return;
  }

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    role: roleId,
    isActive: isActive !== undefined ? isActive : true,
  });

  await user.populate({ path: 'role', populate: { path: 'permissions' } });

  // Audit log
  await createAuditLog({
    userId: req.user!.id,
    action: 'CREATE_USER',
    details: `Created user: ${user.email}`,
    req,
  });

  // Send welcome email
  await sendWelcomeEmail(user.email, user.firstName, password);

  // Create in-app notification
  await Notification.create({
    userId: user.id,
    title: 'Welcome to EUMS!',
    message: `Hi ${user.firstName}, your account has been created successfully.`,
  });

  res.status(201).json({ success: true, message: 'User created', data: user });
};

// PUT /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, email, roleId, isActive, password } = req.body;
  const userId = req.params.id;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const passwordChanged = password && password.length >= 6;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email.toLowerCase();
  if (roleId) user.role = roleId;
  if (isActive !== undefined) user.isActive = isActive;
  if (passwordChanged) user.password = password;

  await user.save();

  await createAuditLog({
    userId: req.user!.id,
    action: 'EDIT_USER',
    details: `Updated user: ${user.email}`,
    req,
  });

  if (passwordChanged) {
    await sendPasswordResetAlert(user.email, user.firstName);
    await createAuditLog({
      userId: req.user!.id,
      action: 'PASSWORD_RESET',
      details: `Password changed for: ${user.email}`,
      req,
    });
  }

  await user.populate({ path: 'role', populate: { path: 'permissions' } });

  res.status(200).json({ success: true, message: 'User updated', data: user });
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  // Prevent deleting yourself
  if (user.id === req.user!.id) {
    res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    return;
  }

  await sendAccountDeletionAlert(user.email, user.firstName);
  await createAuditLog({
    userId: req.user!.id,
    action: 'DELETE_USER',
    details: `Deleted user: ${user.email}`,
    req,
  });

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: 'User deleted successfully' });
};

// GET /api/users/analytics/dashboard
export const getDashboardAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const [roleStats, activeStats, recentActivity, totalUsers] = await Promise.all([
    User.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleData',
        },
      },
      { $unwind: '$roleData' },
      {
        $group: {
          _id: '$roleData.name',
          count: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 },
        },
      },
    ]),
    AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName email'),
    User.countDocuments(),
  ]);

  const roleMap: Record<string, number> = {};
  roleStats.forEach((r) => {
    roleMap[r._id] = r.count;
  });

  const activeCount = activeStats.find((s) => s._id === true)?.count || 0;
  const inactiveCount = activeStats.find((s) => s._id === false)?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalAdmins: roleMap['ADMIN'] || 0,
      totalManagers: roleMap['MANAGER'] || 0,
      totalRegularUsers: roleMap['USER'] || 0,
      activeAccounts: activeCount,
      inactiveAccounts: inactiveCount,
      recentActivity,
    },
  });
};

// GET /api/users/audit-logs
export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email profileImage'),
    AuditLog.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    data: logs,
  });
};

// GET /api/roles
export const getRoles = async (_req: AuthRequest, res: Response): Promise<void> => {
  const roles = await Role.find().populate('permissions');
  res.status(200).json({ success: true, data: roles });
};
