// index.js — Express server for support analytics API
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const pool    = require('./db');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── SQL Query ────────────────────────────────────────────────
// Single optimised query:
//   • INNER JOIN: only valid customer rows, no N+1
//   • WHERE resolved = false AND failure_category IS NOT NULL: filtered at DB level
//   • GROUP BY + COUNT(*) + ORDER BY ticket_count DESC: single aggregation pass
//   • LIMIT 3: database stops after collecting top 3 groups
//   • $1 parameterised: prevents SQL injection
const TOP_FAILURES_QUERY = `
  SELECT
      t.failure_category,
      COUNT(*) AS ticket_count
  FROM tickets t
  INNER JOIN customers c
      ON c.customer_id = t.customer_id
  WHERE
      t.customer_id        = $1
      AND t.resolved       = false
      AND t.failure_category IS NOT NULL
  GROUP BY
      t.failure_category
  ORDER BY
      ticket_count DESC
  LIMIT 3
`;

// ── Routes ───────────────────────────────────────────────────

/**
 * GET /api/analytics/top-failures/:customer_id
 *
 * Returns the top 3 most frequent unresolved failure categories
 * for the given customer.
 *
 * Response shape:
 * {
 *   customer_id: string,
 *   data: [
 *     { failure_category: string, ticket_count: number },
 *     ...
 *   ]
 * }
 *
 * Empty `data` array means no unresolved tagged tickets for this customer.
 */
app.get('/api/analytics/top-failures/:customer_id', async (req, res) => {
  const { customer_id } = req.params;

  // Basic guard — prevent obviously invalid inputs from hitting the DB
  if (!customer_id || customer_id.trim() === '') {
    return res.status(400).json({ error: 'customer_id is required.' });
  }

  if (process.env.DEMO_MODE === 'true') {
    // ── DEMO MODE: Bypass DB for local viewing ──
    const mockData = [
      { failure_category: 'integration_error', ticket_count: 18 },
      { failure_category: 'billing_confusion', ticket_count: 12 },
      { failure_category: 'feature_misunderstanding', ticket_count: 7 }
    ];
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network latency
    return res.json({ customer_id, data: mockData });
  }

  try {
    const result = await pool.query(TOP_FAILURES_QUERY, [customer_id]);

    // Convert ticket_count from string (pg default) to integer
    const data = result.rows.map((row) => ({
      failure_category: row.failure_category,
      ticket_count: parseInt(row.ticket_count, 10),
    }));

    return res.json({ customer_id, data });
  } catch (err) {
    console.error('Error executing top-failures query:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Analytics API listening on http://localhost:${PORT}`);
});
