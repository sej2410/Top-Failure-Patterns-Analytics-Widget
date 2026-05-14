// seed.js — Script to initialize and seed the PostgreSQL database
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log('Connecting to database...');
  try {
    await pool.query('BEGIN');

    // 1. Create tables
    console.log('Creating tables...');
    await pool.query(`
      DROP TABLE IF EXISTS tickets;
      DROP TABLE IF EXISTS customers;

      CREATE TABLE customers (
        customer_id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL
      );

      CREATE TABLE tickets (
        ticket_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50) REFERENCES customers(customer_id),
        resolved BOOLEAN DEFAULT false,
        failure_category VARCHAR(100)
      );
    `);

    // 2. Insert dummy customers
    console.log('Inserting customers...');
    await pool.query(`
      INSERT INTO customers (customer_id, customer_name)
      VALUES 
        ('cust_001', 'Acme Corp'),
        ('cust_002', 'Globex Inc');
    `);

    // 3. Insert dummy tickets for cust_001 (mimicking the demo data)
    console.log('Inserting tickets...');
    
    // We want: 18 integration_error, 12 billing_confusion, 7 feature_misunderstanding
    let ticketsQuery = `INSERT INTO tickets (customer_id, resolved, failure_category) VALUES `;
    let values = [];
    
    for(let i=0; i<18; i++) values.push(`('cust_001', false, 'integration_error')`);
    for(let i=0; i<12; i++) values.push(`('cust_001', false, 'billing_confusion')`);
    for(let i=0; i<7; i++) values.push(`('cust_001', false, 'feature_misunderstanding')`);
    // Add some resolved ones or other categories that shouldn't show up in top 3
    for(let i=0; i<5; i++) values.push(`('cust_001', false, 'login_issue')`);
    for(let i=0; i<20; i++) values.push(`('cust_001', true, 'integration_error')`); // resolved, shouldn't count
    
    ticketsQuery += values.join(', ') + ';';
    await pool.query(ticketsQuery);

    await pool.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error seeding database:', err);
  } finally {
    pool.end();
  }
}

seed();
