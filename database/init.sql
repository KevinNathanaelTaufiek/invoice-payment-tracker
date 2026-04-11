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
