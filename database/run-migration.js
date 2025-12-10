/**
 * Run specific migration file
 * Usage: node run-migration.js <migration_file>
 * Example: node run-migration.js 011_create_sale_product.sql
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function getDbCredentials() {
  const secretArn = process.env.DB_SECRET_ARN || 'arn:aws:secretsmanager:ap-southeast-1:706302944148:secret:OJT-Ecommerce-db-credentials-q6xNBc';
  const client = new SecretsManagerClient({ region: 'ap-southeast-1' });
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));
  return JSON.parse(response.SecretString);
}

async function getConfig() {
  const credentials = await getDbCredentials();
  return {
    host: process.env.DB_HOST || 'ojt-ecommerce-databasestack-mysqlinstance216dd474-umgxaa4gzisu.ct4omg804mlf.ap-southeast-1.rds.amazonaws.com',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: credentials.username || 'admin',
    password: credentials.password,
    database: process.env.DB_NAME || 'ojtdb',
    multipleStatements: true,
    connectTimeout: 30000,
  };
}

async function runMigration(migrationFile) {
  console.log(`\n🚀 Running migration: ${migrationFile}`);
  
  const migrationPath = path.join(__dirname, 'migrations', migrationFile);
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  const statements = sql
    .split(/;[\s]*(?=\n|$)/)
    .map(s => s.trim())
    .filter(s => {
      if (s.length === 0) return false;
      const withoutComments = s.replace(/--[^\n]*\n?/g, '').trim();
      return withoutComments.length > 0;
    });
  
  console.log(`   Found ${statements.length} SQL statements`);
  
  try {
    const config = await getConfig();
    const connection = await mysql.createConnection(config);
    
    for (const stmt of statements) {
      try {
        await connection.execute(stmt);
        const tableMatch = stmt.match(/CREATE TABLE[^`]*`?(\w+)`?/i);
        const insertMatch = stmt.match(/INSERT[^`]*`?(\w+)`?/i);
        const indexMatch = stmt.match(/CREATE INDEX (\w+)/i);
        
        if (tableMatch) console.log(`   ✅ Created table: ${tableMatch[1]}`);
        else if (insertMatch) console.log(`   ✅ Inserted into: ${insertMatch[1]}`);
        else if (indexMatch) console.log(`   ✅ Created index: ${indexMatch[1]}`);
        else console.log(`   ✅ Executed statement`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`   ⚠️  Table already exists, skipping...`);
        } else if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`   ⚠️  Index already exists, skipping...`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    await connection.end();
    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.log('Usage: node run-migration.js <migration_file>');
  console.log('Example: node run-migration.js 011_create_sale_product.sql');
  process.exit(1);
}

runMigration(migrationFile);
