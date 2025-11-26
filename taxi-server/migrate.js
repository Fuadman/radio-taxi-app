require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'taxi',
  password: process.env.DB_PASSWORD || 'taxi_password',
  database: process.env.DB_NAME || 'taxi_db',
});

async function runFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
}

async function main() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const initFile = path.join(migrationsDir, 'init.sql');
    console.log('Running migration:', initFile);
    await runFile(initFile);
    if (process.argv.includes('--seed')) {
      // Prefer a JS seed script (allows bcrypt hashing); fallback to SQL seed
      const seedJs = path.join(__dirname, 'seed.js');
      const seedFile = path.join(migrationsDir, 'seed.sql');
      if (fs.existsSync(seedJs)) {
        console.log('Running JS seed:', seedJs);
        const { runSeed } = require(seedJs);
        await runSeed();
      } else if (fs.existsSync(seedFile)) {
        console.log('Running SQL seed:', seedFile);
        await runFile(seedFile);
      } else {
        console.log('No seed file found');
      }
    }
    console.log('Migrations complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
