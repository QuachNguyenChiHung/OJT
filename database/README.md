# 📦 Database Scripts

Database schema và migration scripts cho OJT E-commerce (Serverless).

## 📁 Structure

```
database/
├── schema/
│   └── mysql_schema.sql      # Main schema cho RDS Aurora MySQL
├── migrations/
│   ├── 001_add_isactive.sql  # Add is_active column to products
│   └── 002_add_cod_columns.sql # Add COD order columns
├── seeds/
│   └── sample_data.sql       # Sample data for testing
├── helpers/
│   └── testing_queries.sql   # Helper queries for testing
└── legacy/
    └── mssql_schema.sql      # Original MSSQL schema (reference only)
```

## 🚀 Usage

### 1. Create Schema
```bash
mysql -h <RDS_ENDPOINT> -u admin -p < schema/mysql_schema.sql
```

### 2. Run Migrations
```bash
mysql -h <RDS_ENDPOINT> -u admin -p < migrations/001_add_isactive.sql
mysql -h <RDS_ENDPOINT> -u admin -p < migrations/002_add_cod_columns.sql
```

### 3. Seed Data (Optional)
```bash
mysql -h <RDS_ENDPOINT> -u admin -p < seeds/sample_data.sql
```

## 📊 Tables

| Table | Description |
|-------|-------------|
| app_users | User accounts |
| categories | Product categories |
| brands | Product brands |
| products | Products |
| product_details | Product variants (size, color, images) |
| cart | Shopping cart |
| customer_orders | Orders |
| order_details | Order items |
| ratings | Product ratings |
| banners | Homepage banners |

## 🔗 Relationships

```
app_users ─┬─< cart
           ├─< customer_orders ─< order_details
           ├─< ratings
           └─< banners

categories ─< products ─< product_details ─< order_details
                      └─< ratings

brands ─< products
```
