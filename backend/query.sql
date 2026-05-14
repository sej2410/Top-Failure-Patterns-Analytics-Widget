-- =============================================================
-- Top 3 Unresolved Failure Categories for a Given Customer
-- =============================================================
-- Parameters:
--   $1 → customer_id (UUID or INT, matches customers.customer_id)
--
-- Returns:
--   failure_category  TEXT   — the tag on the support ticket
--   ticket_count      BIGINT — number of unresolved tickets in this category
--
-- Design decisions:
--   • INNER JOIN ensures we only process tickets for valid customers
--   • `resolved = false` restricts to open/unresolved tickets only
--   • `failure_category IS NOT NULL` excludes untagged tickets at the DB level
--   • GROUP BY + COUNT(*) + ORDER BY ticket_count DESC — single aggregation pass
--   • LIMIT 3 — the DB can stop once the top 3 groups are identified;
--     combined with an index on (customer_id, resolved, failure_category)
--     this becomes extremely efficient
--   • Parameterised placeholder ($1) prevents SQL injection
-- =============================================================

SELECT
    t.failure_category,
    COUNT(*) AS ticket_count
FROM tickets t
INNER JOIN customers c
    ON c.customer_id = t.customer_id
WHERE
    t.customer_id    = $1
    AND t.resolved   = false
    AND t.failure_category IS NOT NULL
GROUP BY
    t.failure_category
ORDER BY
    ticket_count DESC
LIMIT 3;

-- =============================================================
-- Recommended index for this query:
-- CREATE INDEX CONCURRENTLY idx_tickets_customer_open_category
--     ON tickets (customer_id, resolved, failure_category)
--     WHERE resolved = false AND failure_category IS NOT NULL;
-- =============================================================
