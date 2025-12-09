/**
 * SQL Server Schema Runner
 * Connect to RDS SQL Server and run schema script
 * 
 * Usage:
 *   node run-schema.js           # Run full schema
 *   node run-schema.js --test    # Test connection only
 */
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Database config from environment or defaults
const config = {
  server: process.env.DB_HOST || 'ojt-ecommerce-databasesta-sqlserverinstance93b7c65-nkdhmvafjntq.ct4omg804mlf.ap-southeast-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '7yh3pDV69SsdrX1w',
  database: process.env.DB_NAME || 'master',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 60000,
  },
};

const args = process.argv.slice(2);
const testOnly = args.includes('--test');

async function testConnection() {
  console.log('\n🔌 Testing SQL Server connection...');
  console.log(`   Server: ${config.server}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT @@VERSION AS version');
    console.log('\n✅ Connection successful!');
    console.log(`   SQL Server: ${result.recordset[0].version.split('\n')[0]}`);
    
    // List databases
    const dbs = await pool.request().query('SELECT name FROM sys.databases');
    console.log('\n📁 Databases:');
    dbs.recordset.forEach(db => console.log(`   - ${db.name}`));
    
    await pool.close();
    return true;
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    return false;
  }
}

async function runSchema() {
  console.log('\n🚀 Running SQL Server Schema...');
  
  const schemaPath = path.join(__dirname, 'schema', 'sqlserver_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }
  
  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
  
  // Split by GO statements
  const batches = schemaSQL
    .split(/\nGO\s*\n/i)
    .map(b => b.trim())
    .filter(b => b.length > 0);
  
  console.log(`   Found ${batches.length} SQL batches`);
  
  try {
    const pool = await sql.connect(config);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        await pool.request().query(batch);
        success++;
        
        // Show progress for table creation
        const tableMatch = batch.match(/CREATE TABLE (\w+)/i);
        if (tableMatch) {
          console.log(`   ✅ Created table: ${tableMatch[1]}`);
        }
      } catch (error) {
        failed++;
        console.error(`   ❌ Batch ${i + 1} failed:`, error.message);
      }
    }
    
    console.log('\n📊 Schema execution complete!');
    console.log(`   Success: ${success} batches`);
    if (failed > 0) console.log(`   Failed: ${failed} batches`);
    
    // Verify tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n📋 Tables in database:');
    tables.recordset.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    
    await pool.close();
    
  } catch (error) {
    console.error('\n❌ Schema execution failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('═'.repeat(50));
  console.log('  OJT E-commerce Database Setup');
  console.log('═'.repeat(50));
  
  if (testOnly) {
    await testConnection();
  } else {
    const connected = await testConnection();
    if (connected) {
      await runSchema();
    }
  }
  
  console.log('\n' + '═'.repeat(50));
}

main().catch(console.error);
