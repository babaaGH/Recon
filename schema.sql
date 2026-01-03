-- Target Logos Database Schema
-- Tracks companies you're prospecting for IT services sales

CREATE TABLE IF NOT EXISTS target_logos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL UNIQUE,
    industry TEXT,
    tech_stack TEXT,
    stalking_status TEXT DEFAULT 'Targeting' CHECK(stalking_status IN ('Targeting', 'Contacted', 'In Discussion', 'Logo Won!', 'Lost')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster searches by company name and status
CREATE INDEX IF NOT EXISTS idx_company_name ON target_logos(company_name);
CREATE INDEX IF NOT EXISTS idx_stalking_status ON target_logos(stalking_status);

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_target_logos_timestamp
AFTER UPDATE ON target_logos
BEGIN
    UPDATE target_logos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
