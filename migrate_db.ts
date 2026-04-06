import { query } from './lib/db';

async function migrate() {
    console.log('Starting migration...');
    try {
        await query('ALTER TABLE goats_data ADD COLUMN IF NOT EXISTS blood_percent DECIMAL(5,2)');
        console.log('Success: blood_percent column added.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
