# ✅ Updated S3 Configuration - Using AWS_S3_ACCESS_KEY_ID & AWS_S3_SECRET_ACCESS_KEY

## What Was Fixed

1. ✅ **ImageUploadController.java** - Recreated (was empty)
2. ✅ **S3Config.java** - Updated to use `AWS_S3_ACCESS_KEY_ID` and `AWS_S3_SECRET_ACCESS_KEY`
3. ✅ **application.properties** - Added S3-specific environment variables

## Environment Variables Required

Add these to your `.env` file:

```env
# S3-Specific Credentials
AWS_S3_ACCESS_KEY_ID=AKIA5VV7U426N4UQ4WGY
AWS_S3_SECRET_ACCESS_KEY=JIaKqDE8lubeKib9BnBdjdmK41QDHtsj+8CRh5iK
AWS_S3_BUCKET_NAME=your-bucket-name-here

# Region (shared)
AWS_REGION=ap-southeast-1
```

## Configuration Mapping

### From .env to application.properties:
```
AWS_S3_ACCESS_KEY_ID       → aws.s3.access.key.id
AWS_S3_SECRET_ACCESS_KEY   → aws.s3.secret.access.key
AWS_S3_BUCKET_NAME         → aws.s3.bucket.name
AWS_REGION                 → aws.region
```

### From application.properties to S3Config.java:
```java
@Value("${aws.s3.access.key.id}")
private String awsAccessKeyId;

@Value("${aws.s3.secret.access.key}")
private String awsSecretAccessKey;

@Value("${aws.region}")
private String awsRegion;
```

## Current application.properties

```properties
# AWS Configuration (General - for Bedrock, etc.)
aws.access.key.id=${AWS_ACCESS_KEY_ID:AKIA5VV7U426N4UQ4WGY}
aws.secret.access.key=${AWS_SECRET_ACCESS_KEY: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}
aws.region=${AWS_REGION:ap-southeast-1}

# AWS S3 Configuration (Specific for S3 image uploads)
aws.s3.access.key.id=${AWS_S3_ACCESS_KEY_ID:AKIA5VV7U426N4UQ4WGY}
aws.s3.secret.access.key=${AWS_S3_SECRET_ACCESS_KEY:JIaKqDE8lubeKib9BnBdjdmK41QDHtsj+8CRh5iK}
aws.s3.bucket.name=${AWS_S3_BUCKET_NAME:your-bucket-name}
```

## Files Updated

### 1. ImageUploadController.java
**Status:** ✅ Complete (was empty, now has full implementation)

**Endpoints:**
- `POST /api/images/upload` - Upload single image
- `POST /api/images/upload-multiple` - Upload multiple images
- `DELETE /api/images/delete` - Delete image

### 2. S3Config.java
**Status:** ✅ Updated

**Changes:**
```java
// OLD:
@Value("${aws.access.key.id}")

// NEW:
@Value("${aws.s3.access.key.id}")
```

### 3. application.properties
**Status:** ✅ Updated

**Added:**
```properties
aws.s3.access.key.id=${AWS_S3_ACCESS_KEY_ID:...}
aws.s3.secret.access.key=${AWS_S3_SECRET_ACCESS_KEY:...}
```

## How to Use

### Option 1: Using .env file (Recommended)
Create/update `.env` file in project root:
```env
AWS_S3_ACCESS_KEY_ID=AKIA5VV7U426N4UQ4WGY
AWS_S3_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET_NAME=my-product-images-bucket
AWS_REGION=ap-southeast-1
```

### Option 2: Using System Environment Variables
Set in Windows:
```cmd
setx AWS_S3_ACCESS_KEY_ID "AKIA5VV7U426N4UQ4WGY"
setx AWS_S3_SECRET_ACCESS_KEY "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"
setx AWS_S3_BUCKET_NAME "my-product-images-bucket"
setx AWS_REGION "ap-southeast-1"
```

### Option 3: Hardcode in application.properties (Not Recommended)
```properties
aws.s3.access.key.id=AKIA5VV7U426N4UQ4WGY
aws.s3.secret.access.key=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
aws.s3.bucket.name=my-product-images-bucket
aws.region=ap-southeast-1
```

## Quick Start Steps

1. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket (e.g., `my-product-images`)
   - Note the bucket name

2. **Update .env File**
   ```env
   AWS_S3_ACCESS_KEY_ID=AKIA5VV7U426N4UQ4WGY
   AWS_S3_SECRET_ACCESS_KEY=JIaKqDE8lubeKib9BnBdjdmK41QDHtsj+8CRh5iK
   AWS_S3_BUCKET_NAME=my-product-images
   AWS_REGION=ap-southeast-1
   ```

3. **Build Project**
   ```bash
   ./mvnw clean install -DskipTests
   ```

4. **Start Application**
   ```bash
   ./mvnw spring-boot:run
   ```

5. **Test with Postman**
   - URL: `POST http://localhost:8080/api/images/upload`
   - Body: form-data
   - Key: `file` (type: File)
   - Select image and send

## Expected Response

```json
{
    "success": true,
    "message": "Image uploaded successfully",
    "imageUrl": "https://my-product-images.s3.ap-southeast-1.amazonaws.com/images/uuid.jpg",
    "fileName": "my-image.jpg",
    "fileSize": 245678
}
```

## Verification Checklist

- [x] ImageUploadController.java has all endpoints
- [x] S3Config uses `aws.s3.access.key.id` and `aws.s3.secret.access.key`
- [x] application.properties maps to `AWS_S3_ACCESS_KEY_ID` and `AWS_S3_SECRET_ACCESS_KEY`
- [x] Default values fallback to existing credentials if env vars not set
- [ ] Maven build completed (download S3 SDK)
- [ ] S3 bucket created in AWS
- [ ] Bucket name updated in .env or application.properties
- [ ] Application started successfully
- [ ] Test upload works

## Troubleshooting

### Issue: "Cannot resolve symbol 's3'"
**Cause:** S3 SDK not downloaded yet
**Solution:** Run `./mvnw clean install -DskipTests`

### Issue: "Bucket not found"
**Cause:** Bucket name mismatch or doesn't exist
**Solution:** 
1. Check bucket name in AWS Console
2. Update `AWS_S3_BUCKET_NAME` in .env
3. Restart application

### Issue: "Access Denied"
**Cause:** Invalid credentials or insufficient permissions
**Solution:**
1. Verify `AWS_S3_ACCESS_KEY_ID` is correct
2. Verify `AWS_S3_SECRET_ACCESS_KEY` is correct
3. Check IAM user has S3 permissions

## All Set! 🚀

Your S3 image upload is now configured to use:
- ✅ `AWS_S3_ACCESS_KEY_ID` from .env
- ✅ `AWS_S3_SECRET_ACCESS_KEY` from .env
- ✅ `AWS_S3_BUCKET_NAME` from .env
- ✅ ImageUploadController is complete with all endpoints

Just need to:
1. Build project (download S3 SDK)
2. Create S3 bucket
3. Update bucket name in .env
4. Test!

