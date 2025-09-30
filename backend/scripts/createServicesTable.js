import { connectPostgreSQL, query } from '../config/postgres.js';

async function createServicesTable() {
  try {
    await connectPostgreSQL();
    
    // Create services table
    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(100) NOT NULL,
        service_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Services table created successfully');
    
    // Insert some sample data
    await query(`
      INSERT INTO services (service_name, service_type) VALUES 
      ('Oil Change', 'Maintenance'),
      ('Brake Repair', 'Repair'),
      ('Tire Replacement', 'Maintenance'),
      ('Engine Diagnostics', 'Diagnostics'),
      ('AC Service', 'Maintenance')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Sample services data inserted');
    
    // Verify the data
    const result = await query('SELECT * FROM services ORDER BY id');
    console.log('Current services in database:', result.rows);
    
  } catch (error) {
    console.error('Error creating services table:', error);
  } finally {
    process.exit(0);
  }
}

createServicesTable();