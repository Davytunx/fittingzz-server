import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { users } from '../modules/user/user.schema.js';
import { eq } from 'drizzle-orm';

/**
 * Create super admin user
 */
async function createSuperAdmin() {
  const email = 'admin@fittingz.com';
  const password = 'SuperAdmin123!';
  
  try {
    // Check if super admin already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existing.length > 0) {
      console.log('✅ Super admin already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create super admin
    const result = await db.insert(users).values({
      businessName: 'Fittingz Admin',
      email,
      password: hashedPassword,
      role: 'super_admin',
      isEmailVerified: true,
      isActive: true,
    }).returning();

    console.log('✅ Super admin created successfully');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 ID:', result[0]?.id);
    
  } catch (error) {
    console.error('❌ Failed to create super admin:', error);
  }
}

createSuperAdmin();