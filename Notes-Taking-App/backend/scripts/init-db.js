const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Connect to database
        const client = await pool.connect();
        
        try {
            // Begin transaction
            await client.query('BEGIN');

            // Execute schema
            await client.query(schema);

            // Commit transaction
            await client.query('COMMIT');
            
            console.log('Database initialized successfully!');
        } catch (error) {
            // Rollback in case of error
            await client.query('ROLLBACK');
            console.error('Error initializing database:', error);
            throw error;
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    } finally {
        // Close the pool
        await pool.end();
    }
}

// Run the initialization
initDatabase().catch(console.error);
