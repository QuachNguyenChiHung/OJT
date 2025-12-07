# AWS S3 Image Upload Feature

## Overview
This feature allows you to upload images to AWS S3 bucket using REST API endpoints.

## Prerequisites
1. AWS Account with S3 access
2. S3 Bucket created in your AWS account
3. AWS Access Key ID and Secret Access Key with S3 permissions

## Configuration

### 1. Update `application.properties`
Set your S3 bucket name:
```properties
aws.s3.bucket.name=your-bucket-name-here
```

The AWS credentials are already configured from your environment variables:
- `aws.access.key.id=AKIA5VV7U426N4UQ4WGY`
- `aws.secret.access.key=JIaKqDE8lubeKib9BnBdjdmK41QDHtsj+8CRh5iK`
- `aws.region=ap-southeast-1`

### 2. Create S3 Bucket
1. Go to AWS S3 Console
2. Create a new bucket (e.g., `my-product-images`)
3. **Important**: Configure bucket permissions for public access (if you want images to be publicly accessible):
   - Bucket Policy example:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::your-bucket-name/*"
           }
       ]
   }
   ```

## API Endpoints

### 1. Upload Single Image
**Endpoint:** `POST /api/images/upload`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Parameter: `file` (MultipartFile)

**Example using cURL:**
```bash
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@/path/to/your/image.jpg"
```

**Example using Postman:**
1. Select POST method
2. Enter URL: `http://localhost:8080/api/images/upload`
3. Go to Body tab
4. Select "form-data"
5. Add key "file" with type "File"
6. Choose your image file

**Response:**
```json
{
    "success": true,
    "message": "Image uploaded successfully",
    "imageUrl": "https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid-filename.jpg",
    "fileName": "original-filename.jpg",
    "fileSize": 123456
}
```

### 2. Upload Multiple Images
**Endpoint:** `POST /api/images/upload-multiple`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Parameter: `files` (MultipartFile[])

**Example using cURL:**
```bash
curl -X POST http://localhost:8080/api/images/upload-multiple \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

**Response:**
```json
{
    "success": true,
    "message": "Images uploaded successfully",
    "imageUrls": [
        "https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid-1.jpg",
        "https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid-2.jpg"
    ],
    "count": 2
}
```

### 3. Delete Image
**Endpoint:** `DELETE /api/images/delete`

**Request:**
- Method: `DELETE`
- Query Parameter: `imageUrl` (String)

**Example using cURL:**
```bash
curl -X DELETE "http://localhost:8080/api/images/delete?imageUrl=https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid-filename.jpg"
```

**Response:**
```json
{
    "success": true,
    "message": "Image deleted successfully"
}
```

## File Restrictions
- Maximum file size: 10MB
- Allowed file types: Images only (image/jpeg, image/png, image/gif, etc.)

## Error Handling

### Common Errors:

1. **Empty file:**
```json
{
    "success": false,
    "message": "File is empty"
}
```

2. **Invalid file type:**
```json
{
    "success": false,
    "message": "File must be an image"
}
```

3. **S3 upload failure:**
```json
{
    "success": false,
    "message": "Failed to upload image to S3: [error details]"
}
```

## Testing with test-image-upload.http

You can use the provided `test-image-upload.http` file with IntelliJ IDEA or VS Code REST Client extension:

1. Open `test-image-upload.http`
2. Update the file paths to point to your actual images
3. Click "Run" or "Send Request" next to each endpoint

## Integration Example

### Using with Product Details:
```java
@PostMapping("/products/{productId}/details")
public ResponseEntity<ProductDetailsDTO> createProductDetails(
        @PathVariable UUID productId,
        @RequestParam("colorName") String colorName,
        @RequestParam("colorCode") String colorCode,
        @RequestParam("size") String size,
        @RequestParam("amount") BigDecimal amount,
        @RequestParam("images") MultipartFile[] images) {
    
    // Upload images to S3
    String[] imageUrls = imageUploadService.uploadMultipleImages(images);
    
    // Create product details with image URLs
    // ... rest of your logic
}
```

## Security Notes
1. **Never commit AWS credentials to version control**
2. Use environment variables or AWS IAM roles in production
3. Consider adding authentication/authorization to upload endpoints
4. Implement rate limiting to prevent abuse
5. Validate file types and sizes server-side

## Troubleshooting

### Issue: "Access Denied" error
- Check your AWS credentials have S3 permissions
- Verify IAM policy allows `s3:PutObject` and `s3:DeleteObject`

### Issue: Images not accessible after upload
- Check S3 bucket policy allows public read access
- Verify bucket CORS configuration if accessing from browser

### Issue: File size too large
- Increase `spring.servlet.multipart.max-file-size` in application.properties
- Ensure S3 bucket has sufficient storage

## Next Steps
1. Create your S3 bucket in AWS Console
2. Update `aws.s3.bucket.name` in application.properties
3. Test the upload endpoint with Postman or cURL
4. Integrate with your existing product/user profile features

