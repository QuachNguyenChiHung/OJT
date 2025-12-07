# Quick Start - S3 Image Upload Testing

## Prerequisites Checklist
- [ ] AWS Account created
- [ ] S3 Bucket created (note the name: _______________)
- [ ] Bucket name updated in `application.properties`
- [ ] Application is running on port 8080

## Test 1: Upload Single Image (Postman)

1. Open Postman
2. Create new request:
   - Method: **POST**
   - URL: `http://localhost:8080/api/images/upload`
3. Go to **Body** tab
4. Select **form-data**
5. Add key: `file`
6. Change type from "Text" to **File**
7. Click "Select Files" and choose an image
8. Click **Send**

**Expected Response:**
```json
{
    "success": true,
    "message": "Image uploaded successfully",
    "imageUrl": "https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/[uuid].jpg",
    "fileName": "your-image.jpg",
    "fileSize": 123456
}
```

## Test 2: View Uploaded Image

Copy the `imageUrl` from the response and paste it in your browser. You should see the uploaded image.

If you get "Access Denied", you need to make the bucket public:

### Make Bucket Public:
1. Go to AWS S3 Console
2. Select your bucket
3. Go to **Permissions** tab
4. **Block Public Access** - Click Edit and uncheck "Block all public access"
5. **Bucket Policy** - Add this policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```
Replace `YOUR-BUCKET-NAME` with your actual bucket name.

## Test 3: Upload Multiple Images (Postman)

1. Create new request:
   - Method: **POST**
   - URL: `http://localhost:8080/api/images/upload-multiple`
2. Go to **Body** tab → **form-data**
3. Add key: `files` (type: File) → Select first image
4. Add another row with same key: `files` (type: File) → Select second image
5. Add more rows for more images
6. Click **Send**

**Expected Response:**
```json
{
    "success": true,
    "message": "Images uploaded successfully",
    "imageUrls": [
        "https://your-bucket.s3.region.amazonaws.com/images/uuid1.jpg",
        "https://your-bucket.s3.region.amazonaws.com/images/uuid2.jpg"
    ],
    "count": 2
}
```

## Test 4: Delete Image (Postman)

1. Copy one of the image URLs from previous tests
2. Create new request:
   - Method: **DELETE**
   - URL: `http://localhost:8080/api/images/delete?imageUrl=PASTE_URL_HERE`
3. Click **Send**

**Expected Response:**
```json
{
    "success": true,
    "message": "Image deleted successfully"
}
```

## Common Issues & Solutions

### Issue 1: "File must be an image"
**Solution:** Make sure you're uploading an image file (jpg, png, gif, etc.), not a document or other file type.

### Issue 2: "Failed to upload image to S3: Access Denied"
**Solution:** 
- Check AWS credentials in application.properties
- Verify IAM user has S3 write permissions
- IAM Policy needed:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### Issue 3: Application won't start
**Solution:**
1. Make sure you ran Maven to download S3 dependencies
2. Check application.properties has correct AWS credentials
3. Verify no other application is using port 8080

### Issue 4: Images upload but can't view in browser
**Solution:** The bucket is not public. Follow steps in "Make Bucket Public" above.

### Issue 5: "Bucket not found"
**Solution:** Make sure:
- Bucket name in application.properties matches AWS bucket name exactly
- Bucket exists in the same region as configured (ap-southeast-1)

## Testing with cURL (Alternative to Postman)

### Upload Single Image:
```bash
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@C:\path\to\your\image.jpg"
```

### Upload Multiple Images:
```bash
curl -X POST http://localhost:8080/api/images/upload-multiple \
  -F "files=@C:\path\to\image1.jpg" \
  -F "files=@C:\path\to\image2.jpg"
```

### Delete Image:
```bash
curl -X DELETE "http://localhost:8080/api/images/delete?imageUrl=https://bucket.s3.region.amazonaws.com/images/uuid.jpg"
```

## Verification Checklist

After successful upload, verify:
- [ ] Response shows `"success": true`
- [ ] `imageUrl` is returned in response
- [ ] Image URL works in browser (if bucket is public)
- [ ] Image appears in S3 Console under `images/` folder
- [ ] File name is a UUID (unique identifier)

## Integration Example

Once testing works, integrate with your product endpoints:

```java
// Example: Add to ProductController
@PostMapping("/{productId}/upload-image")
public ResponseEntity<?> uploadProductImage(
        @PathVariable UUID productId,
        @RequestParam("file") MultipartFile file) {
    
    // Upload to S3
    String imageUrl = imageUploadService.uploadImage(file);
    
    // Update product
    Product product = productService.findById(productId);
    product.setImageUrl(imageUrl);
    productService.save(product);
    
    return ResponseEntity.ok(Map.of(
        "success", true,
        "imageUrl", imageUrl
    ));
}
```

## Ready to Test!

1. ✅ Start your Spring Boot application
2. ✅ Open Postman
3. ✅ Follow "Test 1" above
4. ✅ Check response and open image URL

**Need Help?** Check `S3_IMAGE_UPLOAD_README.md` for detailed documentation.

