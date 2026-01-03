// Database migration script - Upgrade to V2 with BI fields
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'stalker.db');
const SCHEMA_PATH = path.join(__dirname, 'schema-v2.sql');

console.log('Starting database migration to V2...');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to database');
});

// Read and execute new schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error executing schema:', err.message);
        process.exit(1);
    }
    console.log('Schema updated successfully!');

    // Insert sample data with BI fields
    insertSampleData(db);
});

function insertSampleData(db) {
    const sampleLogos = [
        {
            company_name: 'Bank of America',
            industry: 'Banking',
            org_type: 'Bank',
            region: 'East Coast',
            revenue: '$94.9B (Q3 2024)',
            stature: 'Stable - Top 3 US Bank',
            it_signal: 'Investing $3.5B in tech modernization. Focus on cloud migration and AI-driven customer service.',
            executive_summary: 'Bank of America is investing $3.5B in technology modernization with a focus on cloud and AI, creating opportunities for IT services partnerships. As a top-3 US bank with stable financials ($94.9B Q3 revenue), they represent a high-value logo in the digital transformation space.',
            stalking_status: 'Targeting',
            notes: 'CTO: Aditya Bhasin. Key decision maker for digital initiatives.'
        },
        {
            company_name: 'Stripe',
            industry: 'Fintech',
            org_type: 'Payment Processor',
            region: 'West',
            revenue: '$16B ARR (2024)',
            stature: 'Growing - Market Leader in Online Payments',
            it_signal: 'Expanding payment infrastructure globally. Announced new embedded finance platform requiring extensive API integrations.',
            executive_summary: 'Stripe is rapidly expanding its global payment infrastructure and recently launched an embedded finance platform requiring extensive API integration work. With $16B ARR and market-leading position in online payments, they need scalable IT services to support their aggressive growth strategy.',
            stalking_status: 'Contacted',
            notes: 'Reached out to VP Engineering. Follow up scheduled for next week.'
        },
        {
            company_name: 'Navy Federal Credit Union',
            industry: 'Financial Services',
            org_type: 'Credit Union',
            region: 'East Coast',
            revenue: '$3.2B net income (2023)',
            stature: 'Strong - Largest Credit Union in US',
            it_signal: 'Modernizing mobile banking platform. Seeking vendors for cybersecurity assessment and cloud migration services.',
            executive_summary: 'Navy Federal Credit Union is actively modernizing their mobile banking platform and seeking vendors for cybersecurity and cloud migration. As the largest credit union in the US with strong financials ($3.2B net income), they represent a stable, high-potential opportunity in the digital banking transformation space.',
            stalking_status: 'Targeting',
            notes: 'Member-focused institution. Emphasize security and reliability in pitch.'
        }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO target_logos (
            company_name, industry, org_type, region, revenue, stature,
            it_signal, executive_summary, stalking_status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleLogos.forEach(logo => {
        insertStmt.run(
            logo.company_name,
            logo.industry,
            logo.org_type,
            logo.region,
            logo.revenue,
            logo.stature,
            logo.it_signal,
            logo.executive_summary,
            logo.stalking_status,
            logo.notes,
            (err) => {
                if (err) {
                    console.error('Error inserting sample data:', err.message);
                } else {
                    console.log(`Added: ${logo.company_name}`);
                }
            }
        );
    });

    insertStmt.finalize(() => {
        console.log('\n✓ Database migration complete!');
        console.log(`Database location: ${DB_PATH}`);
        db.close();
    });
}
