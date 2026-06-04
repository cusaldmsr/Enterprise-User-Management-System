import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import '../models/Role';
import '../models/Permission';
import { createAuditLog } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth';

const generateAccessToken = (id: string, email: string): string => {
  return jwt.sign({ id, email }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  } as jwt.SignOptions);
};

const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  } as jwt.SignOptions);
};

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +refreshToken')
    .populate({ path: 'role', populate: { path: 'permissions' } });

  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id);

  // Persist refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token in HttpOnly, Secure, SameSite=Strict cookie
  // – HttpOnly: prevents JS access (XSS mitigation)
  // – Secure: HTTPS-only in production (eavesdropping mitigation)
  // – SameSite=Strict: blocks cross-site request forgery (CSRF mitigation)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  await createAuditLog({ userId: user.id, action: 'LOGIN', req });

  const { password: _, refreshToken: __, ...userObj } = user.toObject();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: userObj, accessToken },
  });
};

// POST /auth/refresh
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: 'Refresh token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch {
    res.status(401).json({ success: false, message: 'Refresh token expired' });
  }
};

// POST /auth/logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: '' }
      );
    }

    if (req.user) {
      await createAuditLog({ userId: req.user.id, action: 'LOGOUT', req });
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

// GET /auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  res.status(200).json({ success: true, data: { user: req.user } });
};
