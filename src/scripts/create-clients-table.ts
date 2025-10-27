import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function createClientsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(255) NOT NULL,
        gender varchar(10) NOT NULL,
        admin_id uuid NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      )
    `;

    await sql`
      ALTER TABLE clients 
      ADD CONSTRAINT clients_admin_id_users_id_fk 
      FOREIGN KEY (admin_id) REFERENCES users(id) 
      ON DELETE CASCADE
    `;

    console.log('✅ Clients table created successfully');
  } catch (error) {
    console.error('❌ Error creating clients table:', error);
  }
}

createClientsTable();