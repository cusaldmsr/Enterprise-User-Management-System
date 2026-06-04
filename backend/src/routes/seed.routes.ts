import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { runSeed } from '../utils/seed';

const router = Router();

/**
 * POST /api/seed
 * Admin-only endpoint to trigger DummyJSON data seeding.
 * Always replaces existing users.
 */
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await runSeed();
      res.status(200).json({
        success: true,
        message: result.message,
        data: { seeded: result.seeded },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Seed failed';
      res.status(500).json({ success: false, message });
    }
  }
);

export default router;
