# Bedrock Agent Action Group - Product Search

Lambda function cho Bedrock Agent để tìm kiếm sản phẩm từ RDS MySQL.

## Các Actions hỗ trợ

| Action | Mô tả |
|--------|-------|
| `/search-products` | Tìm kiếm sản phẩm theo keyword, category, brand, giá |
| `/product/{productId}` | Lấy chi tiết sản phẩm |
| `/categories` | Lấy danh sách danh mục |
| `/brands` | Lấy danh sách thương hiệu |
| `/products-by-price` | Lấy sản phẩm theo khoảng giá |

## Setup trên AWS Console

### 1. Deploy Lambda Function

```bash
# Từ thư mục OJT_lambda
cd bedrock-agent
zip -r bedrock-agent.zip index.js package.json ../shared/
```

Upload lên Lambda với:
- Runtime: Node.js 20.x
- Handler: index.handler
- Timeout: 30s
- Memory: 512MB

### 2. Cấu hình Environment Variables cho Lambda

```
DB_ENDPOINT=<RDS endpoint>
DB_NAME=ojtdb
DB_SECRET_ARN=<Secrets Manager ARN>
```

### 3. Cấu hình IAM Role cho Lambda

Lambda cần permissions:
- `secretsmanager:GetSecretValue` - đọc DB credentials
- VPC access nếu RDS trong private subnet

### 4. Tạo Action Group trong Bedrock Agent

1. Vào Bedrock Console > Agents > Demo-Agent
2. Chọn "Add Action Group"
3. Cấu hình:
   - Action group name: `ProductSearchActions`
   - Action group type: `Define with API schemas`
   - Select Lambda function: chọn Lambda vừa tạo
   - API Schema: Upload file `openapi-schema.json`
4. Save và Prepare agent

### 5. Test Agent

```
User: Tìm áo thun Nike
Agent: [Gọi searchProducts với keyword="áo thun", brandName="Nike"]
       Tìm thấy 2 sản phẩm:
       1. Áo thun Nike Dri-FIT - 450,000 VND
       ...
```

## Agent ID hiện tại

- Agent ID: `YASFITHPLV`
- Alias ID: `OP2BHIXLGL`
