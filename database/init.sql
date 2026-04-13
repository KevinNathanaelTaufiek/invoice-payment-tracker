-- ============================================================
-- Invoice & Payment Tracker — DDL
-- Run this script manually in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number  VARCHAR(50) NOT NULL UNIQUE,
    client_name     VARCHAR(100) NOT NULL,
    client_email    VARCHAR(255),
    issue_date      DATE NOT NULL,
    due_date        DATE NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'UNPAID'
                        CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE')),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id   UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description  VARCHAR(255) NOT NULL,
    quantity     INTEGER NOT NULL DEFAULT 1,
    unit_price   DECIMAL(15, 2) NOT NULL,
    subtotal     DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE OR REPLACE VIEW invoice_summaries AS
SELECT
    i.user_id,
    COUNT(DISTINCT i.id) AS total_count,
    COUNT(DISTINCT CASE WHEN i.status = 'PAID' THEN i.id END) AS paid_count,
    COUNT(DISTINCT CASE WHEN i.status = 'OVERDUE' THEN i.id END) AS overdue_count,
    COALESCE(SUM(ii.unit_price * ii.quantity), 0) AS total_amount,
    COALESCE(SUM(CASE WHEN i.status = 'PAID' THEN ii.unit_price * ii.quantity ELSE 0 END), 0) AS paid_amount
FROM invoices i
LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
GROUP BY i.user_id;
