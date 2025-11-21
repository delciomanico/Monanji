const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('📊 Connected to PostgreSQL database');
    }
});

pool.on('error', (err) => {
    console.error('💥 Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    pool,
    query: (text, params) => pool.query(text, params)
};
