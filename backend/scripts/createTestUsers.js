import bcrypt from 'bcryptjs';
import { query, connectPostgreSQL } from '../config/postgres.js';

async function createTestUsers() {
  try {
    console.log('Connecting to database...');
    await connectPostgreSQL();
    
    console.log('Creating test users...');

    // Regular user
    const userPassword = await bcrypt.hash('password123', 10);
    await query(`
      INSERT INTO users (email, password_hash, full_name, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['user@test.com', userPassword, 'Test User', 'user']);

    // Admin user  
    const adminPassword = await bcrypt.hash('admin123', 10);
    await query(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO NOTHING
    `, ['admin@test.com', adminPassword, 'Admin User', 'admin']);

    console.log('✅ Test users created successfully!');
    console.log('Regular User: user@test.com / password123');
    console.log('Admin User: admin@test.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();