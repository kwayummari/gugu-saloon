#!/usr/bin/env node

/**
 * Database Migration Runner
 * Automatically runs all pending SQL migrations in order
 * 
 * Usage: node database/migrate.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gugu',
    multipleStatements: true, // Allow multiple SQL statements
};

// Migration directory
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Create database connection
 */
function createConnection() {
    return mysql.createConnection(dbConfig);
}

/**
 * Get list of migration files (sorted)
 */
function getMigrationFiles() {
    const files = fs.readdirSync(MIGRATIONS_DIR);
    return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Alphabetical order (000_, 001_, 002_, etc.)
}

/**
 * Check if migrations table exists, if not create it
 */
async function ensureMigrationsTable(connection) {
    return new Promise((resolve, reject) => {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT(11) NOT NULL AUTO_INCREMENT,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_migration_name (migration_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

        connection.query(createTableSQL, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Get list of already executed migrations
 */
async function getExecutedMigrations(connection) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT migration_name FROM migrations', (error, results) => {
            if (error) {
                reject(error);
            } else {
                const executedMigrations = results.map(row => row.migration_name);
                resolve(executedMigrations);
            }
        });
    });
}

/**
 * Execute a single migration
 */
async function executeMigration(connection, fileName) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(MIGRATIONS_DIR, fileName);
        const sql = fs.readFileSync(filePath, 'utf8');

        connection.query(sql, (error) => {
            if (error) {
                reject(error);
            } else {
                // Record migration as executed
                connection.query(
                    'INSERT INTO migrations (migration_name) VALUES (?)',
                    [fileName],
                    (insertError) => {
                        if (insertError) {
                            reject(insertError);
                        } else {
                            resolve();
                        }
                    }
                );
            }
        });
    });
}

/**
 * Main migration runner
 */
async function runMigrations() {
    let connection;

    try {
        log('\n🚀 Starting database migrations...', 'cyan');
        log(`📂 Database: ${dbConfig.database}`, 'blue');
        log(`📁 Migrations directory: ${MIGRATIONS_DIR}\n`, 'blue');

        // Create connection
        connection = createConnection();

        // Connect to database
        await new Promise((resolve, reject) => {
            connection.connect((error) => {
                if (error) {
                    reject(error);
                } else {
                    log('✅ Connected to database', 'green');
                    resolve();
                }
            });
        });

        // Ensure migrations table exists
        await ensureMigrationsTable(connection);
        log('✅ Migrations table ready', 'green');

        // Get all migration files
        const allMigrations = getMigrationFiles();
        log(`📋 Found ${allMigrations.length} migration files`, 'blue');

        // Get executed migrations
        const executedMigrations = await getExecutedMigrations(connection);
        log(`✅ ${executedMigrations.length} migrations already executed\n`, 'green');

        // Get pending migrations
        const pendingMigrations = allMigrations.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            log('✨ No pending migrations. Database is up to date!', 'green');
            return;
        }

        log(`⏳ Running ${pendingMigrations.length} pending migrations...\n`, 'yellow');

        // Execute each pending migration
        for (const migration of pendingMigrations) {
            try {
                log(`🔄 Executing: ${migration}`, 'yellow');
                await executeMigration(connection, migration);
                log(`✅ Success: ${migration}\n`, 'green');
            } catch (error) {
                log(`❌ Failed: ${migration}`, 'red');
                log(`Error: ${error.message}\n`, 'red');
                throw error;
            }
        }

        log('🎉 All migrations completed successfully!', 'green');

    } catch (error) {
        log('\n❌ Migration failed!', 'red');
        log(`Error: ${error.message}`, 'red');
        if (error.sql) {
            log(`SQL: ${error.sql}`, 'red');
        }
        process.exit(1);
    } finally {
        if (connection) {
            connection.end();
            log('\n🔌 Database connection closed', 'blue');
        }
    }
}

// Run migrations
runMigrations();

