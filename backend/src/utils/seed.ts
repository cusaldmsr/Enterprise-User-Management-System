import 'dotenv/config';
import mongoose from 'mongoose';
import Permission from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';

const PERMISSIONS = [
  { name: 'VIEW_USERS', description: 'View users list and profiles' },
  { name: 'CREATE_USER', description: 'Create new user accounts' },
  { name: 'EDIT_USER', description: 'Edit existing user accounts' },
  { name: 'DELETE_USER', description: 'Delete user accounts' },
  { name: 'UPLOAD_FILES', description: 'Upload profile images and documents' },
  { name: 'VIEW_DASHBOARD', description: 'Access dashboard analytics and audit logs' },
  { name: 'SEARCH_USERS', description: 'Search and filter users' },
];

const ROLES: Record<string, string[]> = {
  ADMIN: ['VIEW_USERS', 'CREATE_USER', 'EDIT_USER', 'DELETE_USER', 'UPLOAD_FILES', 'VIEW_DASHBOARD', 'SEARCH_USERS'],
  MANAGER: ['VIEW_USERS', 'EDIT_USER', 'UPLOAD_FILES', 'SEARCH_USERS'],
  USER: ['VIEW_USERS', 'SEARCH_USERS'],
};

interface DummyUser {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
}

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Permission.deleteMany({});
  await Role.deleteMany({});
  await User.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create permissions
  const permDocs = await Permission.insertMany(PERMISSIONS);
  const permMap = new Map(permDocs.map((p) => [p.name, p._id]));
  console.log(`✅ Created ${permDocs.length} permissions`);

  // Create roles
  const roleMap = new Map<string, mongoose.Types.ObjectId>();
  for (const [roleName, perms] of Object.entries(ROLES)) {
    const role = await Role.create({
      name: roleName,
      permissions: perms.map((p) => permMap.get(p)),
    });
    roleMap.set(roleName, role._id as mongoose.Types.ObjectId);
  }
  console.log('✅ Created 3 roles: ADMIN, MANAGER, USER');

  // Fetch users from DummyJSON
  console.log('📡 Fetching users from DummyJSON...');
  let dummyUsers: DummyUser[] = [];
  try {
    const response = await fetch('https://dummyjson.com/users?limit=30&skip=0');
    const data = await response.json() as { users: DummyUser[] };
    dummyUsers = data.users;
    console.log(`✅ Fetched ${dummyUsers.length} users`);
  } catch (e) {
    console.warn('⚠️  Could not fetch DummyJSON users, using fallback data');
    dummyUsers = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@eums.dev', image: '' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@eums.dev', image: '' },
    ];
  }

  // Create admin user
  await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@eums.dev',
    password: 'Admin@1234',
    role: roleMap.get('ADMIN'),
    profileImage: 'https://api.dicebear.com/8.x/avataaars/svg?seed=admin',
    isActive: true,
  });
  console.log('✅ Admin user created: admin@eums.dev / Admin@1234');

  // Assign roles in a 2:3:5 ratio (Admin:Manager:User)
  const roleAssignment = (i: number): string => {
    if (i % 10 < 2) return 'ADMIN';
    if (i % 10 < 5) return 'MANAGER';
    return 'USER';
  };

  const usersToCreate = dummyUsers.map((u, i) => ({
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email || `user${i + 1}@eums.dev`,
    password: 'Pass@1234',
    role: roleMap.get(roleAssignment(i)),
    profileImage: u.image || `https://api.dicebear.com/8.x/avataaars/svg?seed=${u.firstName}`,
    isActive: i % 7 !== 0, // some inactive
  }));

  await User.insertMany(usersToCreate);
  console.log(`✅ Created ${usersToCreate.length} users from DummyJSON`);

  console.log('\n🎉 Seeding complete!');
  console.log('═══════════════════════════════════');
  console.log('Admin login: admin@eums.dev');
  console.log('Password:    Admin@1234');
  console.log('═══════════════════════════════════\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
