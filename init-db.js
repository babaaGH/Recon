// Database initialization script
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'stalker.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Create and initialize database
function initializeDatabase() {
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            process.exit(1);
        }
        console.log('Connected to SQLite database at:', DB_PATH);
    });

    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema:', err.message);
            process.exit(1);
        }
        console.log('Database schema created successfully!');

        // Insert sample data
        insertSampleData(db);
    });
}

// Insert sample data for testing
function insertSampleData(db) {
    const sampleLogos = [
        {
            company_name: 'Bank of America',
            industry: 'Banking',
            tech_stack: 'Java, Oracle, Mainframe',
            stalking_status: 'Targeting',
            notes: 'Focus on Digital Banking division. CTO is John Smith.'
        },
        {
            company_name: 'Stripe',
            industry: 'Fintech - Payments',
            tech_stack: 'Ruby, Go, React, AWS',
            stalking_status: 'Contacted',
            notes: 'Initial email sent to VP Engineering. Follow up in 1 week.'
        },
        {
            company_name: 'Navy Federal Credit Union',
            industry: 'Credit Union',
            tech_stack: '.NET, Azure, SQL Server',
            stalking_status: 'Targeting',
            notes: 'Exploring cloud migration. Good opportunity for cloud services.'
        }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO target_logos (company_name, industry, tech_stack, stalking_status, notes)
        VALUES (?, ?, ?, ?, ?)
    `);

    sampleLogos.forEach(logo => {
        insertStmt.run(
            logo.company_name,
            logo.industry,
            logo.tech_stack,
            logo.stalking_status,
            logo.notes,
            (err) => {
                if (err) {
                    console.error('Error inserting sample data:', err.message);
                } else {
                    console.log(`Added sample logo: ${logo.company_name}`);
                }
            }
        );
    });

    insertStmt.finalize(() => {
        console.log('\nDatabase initialization complete!');
        console.log(`Database location: ${DB_PATH}`);
        db.close();
    });
}

// Run initialization
initializeDatabase();
