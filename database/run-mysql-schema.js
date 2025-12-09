/**
 * MySQL Schema Runner
 * Connect to RDS Aurora MySQL and run schema script
 * 
 * Usage:
 *   node run-mysql-schema.js           # Run full schema
 *   node run-mysql-schema.js --test    # Test connection only
 *   node run-mysql-schema.js --v2      # Run schema v2 (from aws.sql)
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Get database credentials from Secrets Manager
async function getDbCredentials() {
  const secretArn = process.env.DB_SECRET_ARN || 'arn:aws:secretsmanager:ap-southeast-1:706302944148:secret:OJT-Ecommerce-db-credentials-q6xNBc';
  const client = new SecretsManagerClient({ region: 'ap-southeast-1' });
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));
  return JSON.parse(response.SecretString);
}

// Database config from environment or defaults
async function getConfig(withDatabase = true) {
  const credentials = await getDbCredentials();
  const config = {
    host: process.env.DB_HOST || 'ojt-ecommerce-databasestack-mysqlinstance216dd474-umgxaa4gzisu.ct4omg804mlf.ap-southeast-1.rds.amazonaws.com',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: credentials.username || 'admin',
    password: credentials.password,
    multipleStatements: true,
    connectTimeout: 30000,
  };
  if (withDatabase) {
    config.database = process.env.DB_NAME || 'ojtdb';
  }
  return config;
}

// Create database if not exists
async function ensureDatabase() {
  const dbName = process.env.DB_NAME || 'ojtdb';
  console.log(`\n📁 Ensuring database '${dbName}' exists...`);
  
  try {
    const config = await getConfig(false); // Connect without database
    const connection = await mysql.createConnection(config);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`   ✅ Database '${dbName}' ready`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to create database: ${error.message}`);
    return false;
  }
}

const args = process.argv.slice(2);
const testOnly = args.includes('--test');
const useV2 = args.includes('--v2');

async function testConnection() {
  console.log('\n🔌 Testing MySQL connection...');
  
  try {
    const config = await getConfig();
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    
    const connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT VERSION() AS version');
    console.log('\n✅ Connection successful!');
    console.log(`   MySQL Version: ${rows[0].version}`);
    
    // List tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('   (No tables found)');
    } else {
      tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));
    }
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    return false;
  }
}

async function runSchema() {
  const schemaFile = useV2 ? 'mysql_schema_v2.sql' : 'mysql_schema.sql';
  console.log(`\n🚀 Running MySQL Schema (${schemaFile})...`);
  
  const schemaPath = path.join(__dirname, 'schema', schemaFile);
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }
  
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
  
  // Split by semicolons followed by newline or end of file
  // This handles multi-line statements properly
  const statements = schemaSQL
    .split(/;[\s]*(?=\n|$)/)
    .map(s => s.trim())
    .filter(s => {
      // Filter out empty statements and pure comment blocks
      if (s.length === 0) return false;
      // Remove leading comments and check if there's actual SQL
      const withoutComments = s.replace(/--[^\n]*\n?/g, '').trim();
      return withoutComments.length > 0;
    });
  
  console.log(`   Found ${statements.length} SQL statements`);
  
  try {
    const config = await getConfig();
    const connection = await mysql.createConnection(config);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await connection.execute(stmt);
        success++;
        
        // Show progress for table creation
        const tableMatch = stmt.match(/CREATE TABLE (\w+)/i);
        const dropMatch = stmt.match(/DROP TABLE IF EXISTS (\w+)/i);
        const insertMatch = stmt.match(/INSERT INTO (\w+)/i);
        const alterMatch = stmt.match(/ALTER TABLE (\w+)/i);
        
        if (tableMatch) {
          console.log(`   ✅ Created table: ${tableMatch[1]}`);
        } else if (dropMatch) {
          console.log(`   🗑️  Dropped table: ${dropMatch[1]}`);
        } else if (insertMatch) {
          console.log(`   📝 Inserted into: ${insertMatch[1]}`);
        } else if (alterMatch) {
          console.log(`   🔧 Altered table: ${alterMatch[1]}`);
        }
      } catch (error) {
        failed++;
        console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
        // Continue with other statements
      }
    }
    
    console.log('\n📊 Schema execution complete!');
    console.log(`   Success: ${success} statements`);
    if (failed > 0) console.log(`   Failed: ${failed} statements`);
    
    // Verify tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tables in database:');
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));
    
    await connection.end();
    
  } catch (error) {
    console.error('\n❌ Schema execution failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('═'.repeat(50));
  console.log('  OJT E-commerce MySQL Database Setup');
  console.log('═'.repeat(50));
  
  if (testOnly) {
    await ensureDatabase();
    await testConnection();
  } else {
    const dbReady = await ensureDatabase();
    if (dbReady) {
      const connected = await testConnection();
      if (connected) {
        await runSchema();
      }
    }
  }
  
  console.log('\n' + '═'.repeat(50));
}

main().catch(console.error);
