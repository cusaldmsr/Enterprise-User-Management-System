/**
 * DummyJSON Dynamic Data Seeder
 * ─────────────────────────────
 * Fetches real mock user data from https://dummyjson.com/users and transforms
 * it to match Mongoose schemas using the Table 2 mapping policy:
 *
 *  DummyJSON field │ Mongoose field  │ Transform
 *  ─────────────────┼─────────────────┼───────────────────────────────────
 *  firstName        │ firstName       │ direct
 *  lastName         │ lastName        │ direct
 *  email            │ email           │ .toLowerCase()
 *  image            │ profileImage    │ direct URL string
 *  password         │ password        │ direct (bcrypt hashes on pre-save)
 *  index 0          │ role            │ ADMIN
 *  index 1–4        │ role            │ MANAGER
 *  index 5+         │ role            │ USER
 *
 * Behaviour: ALWAYS replaces existing seeded users (wipe + re-seed).
 *
 * Usage (standalone):
 *   npx ts-node src/utils/seed.ts
 *
 * Usage (via API – admin only):
 *   POST /api/seed
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../models/User';
import Role from '../models/Role';
import Permission from '../models/Permission';

interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  password: string;
}

interface DummyJSONResponse {
  users: DummyUser[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Assign role name based on user index (Table 2 policy):
 *  index 0      → ADMIN
 *  index 1–4    → MANAGER
 *  index 5+     → USER
 */
const resolveRoleName = (index: number): string => {
  if (index === 0) return 'ADMIN';
  if (index <= 4) return 'MANAGER';
  return 'USER';
};

export const runSeed = async (): Promise<{ seeded: number; message: string }> => {
  console.log('🌱 Starting DummyJSON data seed...');

  // ── 1. Fetch from DummyJSON ─────────────────────────────────────────────
  console.log('📡 Fetching users from https://dummyjson.com/users?limit=30...');
  const response = await fetch('https://dummyjson.com/users?limit=30');

  if (!response.ok) {
    throw new Error(`DummyJSON API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as DummyJSONResponse;
  const dummyUsers = data.users;
  console.log(`✅ Fetched ${dummyUsers.length} users from DummyJSON`);

  // ── 2. Load roles from DB ───────────────────────────────────────────────
  const [adminRole, managerRole, userRole] = await Promise.all([
    Role.findOne({ name: 'ADMIN' }),
    Role.findOne({ name: 'MANAGER' }),
    Role.findOne({ name: 'USER' }),
  ]);

  if (!adminRole || !managerRole || !userRole) {
    throw new Error(
      'Roles (ADMIN, MANAGER, USER) not found in DB. Please run the role initialisation first.'
    );
  }

  const roleMap: Record<string, mongoose.Types.ObjectId> = {
    ADMIN: adminRole._id as mongoose.Types.ObjectId,
    MANAGER: managerRole._id as mongoose.Types.ObjectId,
    USER: userRole._id as mongoose.Types.ObjectId,
  };

  // ── 3. Always replace — wipe existing users ────────────────────────────
  console.log('🗑️  Clearing existing users (always-replace mode)...');
  await User.deleteMany({});
  console.log('✅ Existing users cleared');

  // ── 4. Transform + insert using Table 2 mapping policy ─────────────────
  const usersToInsert = dummyUsers.map((du, index) => {
    const roleName = resolveRoleName(index);
    return {
      firstName: du.firstName,
      lastName: du.lastName,
      email: du.email.toLowerCase(), // Table 2: force to lowercase
      password: du.password,         // bcrypt pre-save hook will hash this
      profileImage: du.image,        // Table 2: DummyJSON `image` → `profileImage`
      role: roleMap[roleName],
      isActive: true,
    };
  });

  // insertMany skips the pre-save hook for password hashing, so we create
  // each user individually to trigger the bcrypt pre-save middleware.
  console.log(`🔄 Creating ${usersToInsert.length} users (with bcrypt hashing)...`);
  let seeded = 0;
  for (const userData of usersToInsert) {
    await User.create(userData);
    seeded++;
  }

  const message = `✅ Seeded ${seeded} users from DummyJSON successfully`;
  console.log(message);
  return { seeded, message };
};

// ── Standalone execution ────────────────────────────────────────────────────
const isStandalone = process.argv[1]?.includes('seed');
if (isStandalone) {
  connectDB()
    .then(() => runSeed())
    .then(({ message }) => {
      console.log(message);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed failed:', err.message);
      process.exit(1);
    });
}

// Ensure models are registered when imported from routes
export { User, Role, Permission };
