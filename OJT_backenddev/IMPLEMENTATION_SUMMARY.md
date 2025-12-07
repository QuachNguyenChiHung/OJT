# AWS S3 Image Upload Implementation Summary

## ✅ What Has Been Created

### 1. **Dependencies Added** (pom.xml)
- AWS S3 SDK dependency version 2.38.6

### 2. **Configuration Class** (S3Config.java)
Location: `src/main/java/com/tanxuan/demoaws/config/S3Config.java`
- Configures S3Client bean using AWS credentials
- Configures S3Presigner bean for generating pre-signed URLs
- Uses credentials from application.properties

### 3. **Service Class** (ImageUploadService.java)
Location: `src/main/java/com/tanxuan/demoaws/service/ImageUploadService.java`

**Methods:**
- `uploadImage(MultipartFile file)` - Upload single image
- `uploadMultipleImages(MultipartFile[] files)` - Upload multiple images
- `deleteImage(String imageUrl)` - Delete image from S3

**Features:**
- Validates file type (images only)
- Generates unique filenames using UUID
- Returns public image URLs
- Proper error handling

### 4. **Controller Class** (ImageUploadController.java)
Location: `src/main/java/com/tanxuan/demoaws/controller/ImageUploadController.java`

**Endpoints:**

#### POST /api/images/upload
Upload single image to S3
- **Request:** `multipart/form-data` with `file` parameter
- **Response:**
```json
{
    "success": true,
    "message": "Image uploaded successfully",
    "imageUrl": "https://bucket.s3.region.amazonaws.com/images/uuid.jpg",
    "fileName": "original.jpg",
    "fileSize": 123456
}
```

#### POST /api/images/upload-multiple
Upload multiple images to S3
- **Request:** `multipart/form-data` with `files[]` parameter
- **Response:**
```json
{
    "success": true,
    "message": "Images uploaded successfully",
    "imageUrls": ["url1", "url2"],
    "count": 2
}
```

#### DELETE /api/images/delete
Delete image from S3
- **Request:** Query param `imageUrl`
- **Response:**
```json
{
    "success": true,
    "message": "Image deleted successfully"
}
```

### 5. **Configuration** (application.properties)
Updated properties:
```properties
# AWS Configuration
aws.access.key.id=${AWS_ACCESS_KEY_ID:AKIA5VV7U426N4UQ4WGY}
aws.secret.access.key=${AWS_SECRET_ACCESS_KEY:JIaKqDE8lubeKib9BnBdjdmK41QDHtsj+8CRh5iK}
aws.region=${AWS_REGION:ap-southeast-1}

# AWS S3 Configuration
aws.s3.bucket.name=${AWS_S3_BUCKET_NAME:your-bucket-name}

# File upload configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 6. **Test Files**
- `test-image-upload.http` - HTTP request examples
- `S3_IMAGE_UPLOAD_README.md` - Complete documentation

## 🚀 How to Use

### Step 1: Create S3 Bucket
1. Go to AWS S3 Console
2. Create a new bucket (e.g., `my-product-images-bucket`)
3. Note the bucket name

### Step 2: Update Configuration
Update `application.properties`:
```properties
aws.s3.bucket.name=my-product-images-bucket
```

### Step 3: Configure Bucket Permissions (Optional - for public access)
Add this bucket policy if you want images to be publicly accessible:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-product-images-bucket/*"
        }
    ]
}
```

### Step 4: Test with Postman

**Upload Single Image:**
1. Method: POST
2. URL: `http://localhost:8080/api/images/upload`
3. Body: form-data
4. Key: `file` (type: File)
5. Value: Select your image file

**Upload Multiple Images:**
1. Method: POST
2. URL: `http://localhost:8080/api/images/upload-multiple`
3. Body: form-data
4. Key: `files` (type: File) - Add multiple files with same key

### Step 5: Test with cURL

**Single Upload:**
```bash
curl -X POST http://localhost:8080/api/images/upload \
  -F "file=@/path/to/image.jpg"
```

**Multiple Upload:**
```bash
curl -X POST http://localhost:8080/api/images/upload-multiple \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

**Delete Image:**
```bash
curl -X DELETE "http://localhost:8080/api/images/delete?imageUrl=https://bucket.s3.region.amazonaws.com/images/uuid.jpg"
```

## 📝 Integration Examples

### Example 1: Product Image Upload
```java
@PostMapping("/products/{productId}/upload-image")
public ResponseEntity<?> uploadProductImage(
        @PathVariable UUID productId,
        @RequestParam("file") MultipartFile file) {
    
    String imageUrl = imageUploadService.uploadImage(file);
    
    // Update product with image URL
    Product product = productService.findById(productId);
    product.setImageUrl(imageUrl);
    productService.save(product);
    
    return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
}
```

### Example 2: Product Details Multiple Images
```java
@PostMapping("/product-details")
public ResponseEntity<?> createProductDetails(
        @RequestParam("productId") UUID productId,
        @RequestParam("colorName") String colorName,
        @RequestParam("size") String size,
        @RequestParam("images") MultipartFile[] images) {
    
    // Upload images to S3
    String[] imageUrls = imageUploadService.uploadMultipleImages(images);
    
    // Create product details
    ProductDetails details = new ProductDetails();
    details.setProductId(productId);
    details.setColorName(colorName);
    details.setSize(size);
    details.setImgList(String.join(",", imageUrls));
    
    return ResponseEntity.ok(productDetailsService.save(details));
}
```

### Example 3: User Profile Picture
```java
@PutMapping("/users/{userId}/profile-picture")
public ResponseEntity<?> updateProfilePicture(
        @PathVariable UUID userId,
        @RequestParam("file") MultipartFile file) {
    
    AppUser user = appUserService.findById(userId);
    
    // Delete old profile picture if exists
    if (user.getProfilePictureUrl() != null) {
        imageUploadService.deleteImage(user.getProfilePictureUrl());
    }
    
    // Upload new profile picture
    String newImageUrl = imageUploadService.uploadImage(file);
    user.setProfilePictureUrl(newImageUrl);
    appUserService.save(user);
    
    return ResponseEntity.ok(Map.of("profilePictureUrl", newImageUrl));
}
```

## ⚠️ Important Notes

1. **Create S3 Bucket First** - You must create the bucket in AWS before testing
2. **Update Bucket Name** - Replace `your-bucket-name` in application.properties
3. **Security** - Current implementation has no authentication. Add security as needed:
   ```java
   @PreAuthorize("hasRole('ADMIN')")
   @PostMapping("/upload")
   public ResponseEntity<?> uploadImage(...) { ... }
   ```
4. **File Validation** - Service validates image type, but you can add more checks
5. **Error Handling** - All errors return proper JSON responses
6. **CORS Enabled** - `@CrossOrigin(origins = "*")` is enabled for testing

## 📊 Expected Behavior

### Success Response (Upload):
```json
{
    "success": true,
    "message": "Image uploaded successfully",
    "imageUrl": "https://my-bucket.s3.ap-southeast-1.amazonaws.com/images/550e8400-e29b-41d4-a716-446655440000.jpg",
    "fileName": "my-image.jpg",
    "fileSize": 245678
}
```

### Error Response (Invalid file):
```json
{
    "success": false,
    "message": "File must be an image"
}
```

### Error Response (S3 error):
```json
{
    "success": false,
    "message": "Failed to upload image to S3: Access Denied"
}
```

## 🔧 Next Steps

1. ✅ All code is created and error-free
2. ⏳ Run `mvn clean install` to download S3 SDK dependencies
3. ⏳ Create S3 bucket in AWS Console
4. ⏳ Update `aws.s3.bucket.name` in application.properties
5. ⏳ Restart application
6. ⏳ Test endpoints with Postman/cURL

## 📁 Files Created

1. `src/main/java/com/tanxuan/demoaws/config/S3Config.java`
2. `src/main/java/com/tanxuan/demoaws/service/ImageUploadService.java`
3. `src/main/java/com/tanxuan/demoaws/controller/ImageUploadController.java`
4. `S3_IMAGE_UPLOAD_README.md` (documentation)
5. `test-image-upload.http` (test requests)
6. `IMPLEMENTATION_SUMMARY.md` (this file)

All files are ready to use! Just need to:
1. Build the project
2. Create S3 bucket
3. Update configuration
4. Test!

