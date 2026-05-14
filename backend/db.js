// db.js — PostgreSQL connection pool
// Uses the DATABASE_URL environment variable (set in .env or system environment).
// pg.Pool manages connection reuse automatically — no manual pooling needed.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // uncomment for cloud-hosted PG (Render, Supabase, etc.)
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  process.exit(1);
});

module.exports = pool;
