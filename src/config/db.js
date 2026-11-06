const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    throw new Error('Falta configurar DATABASE_URL en el archivo .env.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
});

pool.on('error', (error) => {
    console.error(
        'Error en una conexión inactiva de PostgreSQL:',
        error.code || 'SIN_CODIGO'
    );
});

module.exports = pool;