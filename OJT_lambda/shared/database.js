// Database utilities for Lambda functions - MySQL
const mysql = require('mysql2/promise');

// Connection pool
let pool = null;

// Get database credentials from Secrets Manager
const getDbCredentials = async () => {
  const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
  const client = new SecretsManagerClient({});
  const response = await client.send(new GetSecretValueCommand({ 
    SecretId: process.env.DB_SECRET_ARN 
  }));
  return JSON.parse(response.SecretString);
};

// Get connection pool
const getPool = async () => {
  if (pool) return pool;
  
  const credentials = await getDbCredentials();
  
  pool = mysql.createPool({
    host: process.env.DB_ENDPOINT,
    port: 3306,
    user: credentials.username,
    password: credentials.password,
    database: process.env.DB_NAME || 'ojtdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
  
  return pool;
};

// Execute SQL query
const executeQuery = async (sql, params = []) => {
  try {
    const pool = await getPool();
    const [rows, fields] = await pool.execute(sql, params);
    return { rows, fields };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// Execute SQL statement (for INSERT, UPDATE, DELETE)
const executeStatement = async (sql, params = []) => {
  try {
    const pool = await getPool();
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// Get single row
const getOne = async (sql, params = []) => {
  const { rows } = await executeQuery(sql, params);
  return rows[0] || null;
};

// Get multiple rows
const getMany = async (sql, params = []) => {
  const { rows } = await executeQuery(sql, params);
  return rows;
};

// Insert and return inserted ID
const insert = async (sql, params = []) => {
  const result = await executeStatement(sql, params);
  return result.insertId;
};

// Update and return affected rows
const update = async (sql, params = []) => {
  const result = await executeStatement(sql, params);
  return result.affectedRows;
};

// Delete and return affected rows
const remove = async (sql, params = []) => {
  const result = await executeStatement(sql, params);
  return result.affectedRows;
};

module.exports = {
  getPool,
  executeQuery,
  executeStatement,
  getOne,
  getMany,
  insert,
  update,
  remove,
};
