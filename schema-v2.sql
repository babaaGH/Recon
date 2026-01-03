-- Updated Schema for Business Intelligence Dossier
-- Adds new fields: org_type, region, revenue, stature, it_signal, executive_summary
-- Removes: tech_stack

-- Drop the old table (for development purposes)
DROP TABLE IF EXISTS target_logos;

-- Create updated table with BI fields
CREATE TABLE IF NOT EXISTS target_logos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL UNIQUE,
    industry TEXT,
    org_type TEXT CHECK(org_type IN ('FI', 'Bank', 'Payment Processor', 'Credit Union', NULL)),
    region TEXT CHECK(region IN ('East Coast', 'South', 'Mid-West', 'West', 'Canada', NULL)),
    revenue TEXT,
    stature TEXT,
    it_signal TEXT,
    executive_summary TEXT,
    stalking_status TEXT DEFAULT 'Targeting' CHECK(stalking_status IN ('Targeting', 'Contacted', 'In Discussion', 'Logo Won!', 'Lost')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_company_name ON target_logos(company_name);
CREATE INDEX IF NOT EXISTS idx_stalking_status ON target_logos(stalking_status);
CREATE INDEX IF NOT EXISTS idx_org_type ON target_logos(org_type);
CREATE INDEX IF NOT EXISTS idx_region ON target_logos(region);

-- Trigger to automatically update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_target_logos_timestamp
AFTER UPDATE ON target_logos
BEGIN
    UPDATE target_logos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
