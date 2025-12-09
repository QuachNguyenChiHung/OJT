// Database Admin Module - Run schema, migrations (MySQL)
const mysql = require('mysql2/promise');
const { successResponse, errorResponse, parseBody } = require('./shared/response');

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

// Get connection
const getConnection = async (database = null) => {
  const credentials = await getDbCredentials();
  return mysql.createConnection({
    host: process.env.DB_ENDPOINT,
    port: 3306,
    user: credentials.username,
    password: credentials.password,
    database: database,
    multipleStatements: true,
  });
};

exports.handler = async (event) => {
  const path = event.path || event.rawPath || '';
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  
  console.log(`[DatabaseModule] ${method} ${path}`);

  if (path.endsWith('/test') && method === 'POST') {
    return testConnection();
  }
  if (path.endsWith('/setup') && method === 'POST') {
    return runSchema();
  }
  if (path.endsWith('/query') && method === 'POST') {
    const { query } = parseBody(event);
    return runQuery(query);
  }

  return errorResponse('Route not found', 404);
};

async function testConnection() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT VERSION() as version');
    await conn.end();
    
    return successResponse({
      status: 'connected',
      version: rows[0].version,
      engine: 'MySQL',
    });
  } catch (error) {
    return errorResponse('Connection failed: ' + error.message, 500);
  }
}

async function runSchema() {
  try {
    const dbName = process.env.DB_NAME || 'ojtdb';
    const conn = await getConnection(dbName);
    const results = [];

    // Create tables
    const tables = [
      // app_users
      `CREATE TABLE IF NOT EXISTS app_users (
        u_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        username VARCHAR(100) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(512),
        full_name VARCHAR(255),
        phone_number VARCHAR(20),
        address VARCHAR(500),
        role ENUM('USER', 'EMPLOYEE', 'ADMIN') DEFAULT 'USER',
        is_active BOOLEAN DEFAULT TRUE,
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // categories
      `CREATE TABLE IF NOT EXISTS categories (
        c_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        c_name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // brands
      `CREATE TABLE IF NOT EXISTS brands (
        b_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        b_name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // products
      `CREATE TABLE IF NOT EXISTS products (
        p_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        p_name VARCHAR(255) NOT NULL,
        p_desc TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id CHAR(36),
        brand_id CHAR(36),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category_id),
        INDEX idx_brand (brand_id),
        INDEX idx_price (price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // product_details
      `CREATE TABLE IF NOT EXISTS product_details (
        pd_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        product_id CHAR(36) NOT NULL,
        color_name VARCHAR(64),
        color_code VARCHAR(20),
        size VARCHAR(10),
        amount INT DEFAULT 0,
        in_stock BOOLEAN DEFAULT TRUE,
        img_list JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // cart
      `CREATE TABLE IF NOT EXISTS cart (
        cart_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        product_details_id CHAR(36) NOT NULL,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product (user_id, product_details_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // customer_orders
      `CREATE TABLE IF NOT EXISTS customer_orders (
        o_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36) NOT NULL,
        status ENUM('PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
        total_price DECIMAL(10,2) NOT NULL,
        payment_method ENUM('ONLINE', 'COD') DEFAULT 'ONLINE',
        shipping_address VARCHAR(500),
        phone_number VARCHAR(20),
        note TEXT,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // order_details
      `CREATE TABLE IF NOT EXISTS order_details (
        od_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        order_id CHAR(36) NOT NULL,
        product_details_id CHAR(36) NOT NULL,
        quantity INT DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        INDEX idx_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // ratings
      `CREATE TABLE IF NOT EXISTS ratings (
        r_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id CHAR(36),
        product_id CHAR(36) NOT NULL,
        rating_value INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product_rating (user_id, product_id),
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // banners
      `CREATE TABLE IF NOT EXISTS banners (
        banner_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255),
        image_url VARCHAR(500) NOT NULL,
        link_url VARCHAR(500),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_by CHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    ];

    for (const sql of tables) {
      try {
        await conn.execute(sql);
        const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        results.push({ table: match ? match[1] : 'unknown', status: 'ok' });
      } catch (err) {
        results.push({ table: 'unknown', status: 'error', message: err.message });
      }
    }

    // Create admin user if not exists
    try {
      await conn.execute(`
        INSERT IGNORE INTO app_users (u_id, username, email, password_hash, full_name, role, is_active)
        VALUES (UUID(), 'admin', 'admin@ojt.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tTmMYjKQBjmPp7NNaB3.Hisu', 'Admin User', 'ADMIN', TRUE)
      `);
      results.push({ table: 'admin_user', status: 'ok' });
    } catch (err) {
      results.push({ table: 'admin_user', status: 'error', message: err.message });
    }

    // List tables
    const [tableRows] = await conn.execute('SHOW TABLES');
    const tableNames = tableRows.map(row => Object.values(row)[0]);
    
    await conn.end();
    
    return successResponse({
      message: 'Schema setup complete',
      results,
      tables: tableNames,
    });
  } catch (error) {
    return errorResponse('Schema setup failed: ' + error.message, 500);
  }
}

async function runQuery(query) {
  if (!query) {
    return errorResponse('Query is required', 400);
  }
  
  try {
    const dbName = process.env.DB_NAME || 'ojtdb';
    const conn = await getConnection(dbName);
    const [rows] = await conn.execute(query);
    await conn.end();
    
    return successResponse({
      rows: Array.isArray(rows) ? rows : [],
      affectedRows: rows.affectedRows || 0,
    });
  } catch (error) {
    return errorResponse('Query failed: ' + error.message, 500);
  }
}
