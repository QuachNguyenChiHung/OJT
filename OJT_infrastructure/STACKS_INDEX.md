# OJT E-commerce Infrastructure Stacks

## Deployed Stacks Summary

| # | Stack | Services | Status | Deploy Time |
|---|-------|----------|--------|-------------|
| 1 | NetworkStack | VPC, Subnets, NAT Gateway | ✅ DEPLOYED | ~5 min |
| 2 | StorageStack | S3 (Images, Logs) | ✅ DEPLOYED | ~2 min |
| 3 | AuthStack | Cognito User Pool, Identity Pool | ✅ DEPLOYED | ~1 min |
| 4 | DatabaseStack | RDS SQL Server Express | ✅ DEPLOYED | ~15 min |
| 5 | ApiStack | API Gateway + 11 Lambda Modules | ✅ DEPLOYED | ~4 min |
| 6 | MonitoringStack | CloudWatch Dashboard, Log Groups | ✅ DEPLOYED | ~1 min |
| 7 | FrontendStack | S3 + CloudFront (OAC) | ⏳ PENDING | ~5 min |

---

## Configuration URLs

### API Gateway
```
https://i1wipz2fzc.execute-api.ap-southeast-1.amazonaws.com/prod
```

### S3 Buckets
- Images: `ojt-ecommerce-images-706302944148`
- Logs: `ojt-ecommerce-logs-706302944148`

### Cognito
- User Pool ID: `ap-southeast-1_opAAV3F1j`
- Client ID: `5m2crqm7eoslddf5gre34o42uc`
- Identity Pool ID: `ap-southeast-1:952e71d8-2a0b-488e-beda-cc0f7b5f0b93`

### Database
- Endpoint: `ojt-ecommerce-databasesta-sqlserverinstance93b7c65-nkdhmvafjntq.ct4omg804mlf.ap-southeast-1.rds.amazonaws.com`
- Port: 1433
- Database: ojtdb

### CloudWatch Dashboard
```
https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#dashboards:name=OJT-Ecommerce-Dashboard
```

---

## Lambda Modules (11 modules)

| Module | Lambda Name | Endpoints |
|--------|-------------|-----------|
| Auth | OJT-Ecommerce-AuthModule | login, signup, logout, me |
| Products | OJT-Ecommerce-ProductsModule | CRUD, search, filters |
| ProductDetails | OJT-Ecommerce-ProductDetailsModule | CRUD, images |
| Cart | OJT-Ecommerce-CartModule | add, get, update, remove |
| Orders | OJT-Ecommerce-OrdersModule | CRUD, status, filters |
| Categories | OJT-Ecommerce-CategoriesModule | CRUD, search |
| Brands | OJT-Ecommerce-BrandsModule | CRUD |
| Banners | OJT-Ecommerce-BannersModule | CRUD, toggle |
| Ratings | OJT-Ecommerce-RatingsModule | get, stats, create |
| Users | OJT-Ecommerce-UsersModule | getAll, getById, updateProfile |
| Images | OJT-Ecommerce-ImagesModule | upload to S3 |

---

## Deploy Commands

```bash
# Deploy all stacks
cd OJT_infrastructure
npx cdk deploy --all --require-approval never

# Deploy specific stack
npx cdk deploy OJT-Ecommerce-NetworkStack
npx cdk deploy OJT-Ecommerce-StorageStack
npx cdk deploy OJT-Ecommerce-AuthStack
npx cdk deploy OJT-Ecommerce-DatabaseStack
npx cdk deploy OJT-Ecommerce-ApiStack
npx cdk deploy OJT-Ecommerce-MonitoringStack
npx cdk deploy OJT-Ecommerce-FrontendStack

# Deploy Lambda code
cd deploy
npm run deploy
```

---

## View Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/OJT-Ecommerce-AuthModule --follow --region ap-southeast-1
aws logs tail /aws/lambda/OJT-Ecommerce-ProductsModule --follow --region ap-southeast-1

# View API Gateway logs
aws logs tail /aws/apigateway/OJT-Ecommerce --follow --region ap-southeast-1
```
