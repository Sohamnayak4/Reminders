import { Pool } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_tkfNO8TbmH7M@ep-withered-lake-a46xgqjg-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
});

export default pool;

// Helper to initialize DB
export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}

