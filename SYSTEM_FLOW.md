# AWS S3 Image Upload - System Flow

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Postman/Frontend)                     │
│                                                                       │
│  Upload Form:                                                        │
│  ┌────────────────────────────────┐                                │
│  │ Select Image: [Choose File]    │                                │
│  │ [Upload Button]                │                                │
│  └────────────────────────────────┘                                │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ POST /api/images/upload
                     │ multipart/form-data
                     │ file: image.jpg
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SPRING BOOT APPLICATION                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ImageUploadController.java                                   │   │
│  │ @PostMapping("/api/images/upload")                          │   │
│  │                                                              │   │
│  │ • Receive MultipartFile                                     │   │
│  │ • Call ImageUploadService                                   │   │
│  │ • Return JSON response                                      │   │
│  └────────────────┬────────────────────────────────────────────┘   │
│                   │                                                  │
│                   ▼                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ImageUploadService.java                                      │   │
│  │                                                              │   │
│  │ • Validate file type (image only)                           │   │
│  │ • Generate UUID filename                                    │   │
│  │ • Prepare S3 request                                        │   │
│  │ • Upload to S3                                              │   │
│  │ • Return public URL                                         │   │
│  └────────────────┬────────────────────────────────────────────┘   │
│                   │                                                  │
│                   ▼                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ S3Config.java (Bean)                                        │   │
│  │                                                              │   │
│  │ • AWS Credentials                                           │   │
│  │ • Region: ap-southeast-1                                    │   │
│  │ • S3Client configured                                       │   │
│  └────────────────┬────────────────────────────────────────────┘   │
│                   │                                                  │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
                    │ AWS SDK Call
                    │ s3Client.putObject()
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS S3 BUCKET                                │
│                                                                       │
│  Bucket: my-product-images                                          │
│  Region: ap-southeast-1                                             │
│                                                                       │
│  Folder Structure:                                                  │
│  ┌────────────────────────────────────────────────────┐            │
│  │ images/                                             │            │
│  │   ├── 550e8400-e29b-41d4-a716-446655440000.jpg    │            │
│  │   ├── 7c9e6679-7425-40de-944b-e07fc1f90ae7.png    │            │
│  │   └── a1b2c3d4-5678-90ab-cdef-1234567890ab.jpeg   │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                       │
│  Public URL:                                                        │
│  https://my-product-images.s3.ap-southeast-1.amazonaws.com/         │
│  images/550e8400-e29b-41d4-a716-446655440000.jpg                   │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      │ Return URL
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT RECEIVES RESPONSE                          │
│                                                                       │
│  JSON Response:                                                      │
│  {                                                                   │
│    "success": true,                                                 │
│    "message": "Image uploaded successfully",                        │
│    "imageUrl": "https://bucket.s3.region.amazonaws.com/...",       │
│    "fileName": "original.jpg",                                      │
│    "fileSize": 245678                                               │
│  }                                                                   │
│                                                                       │
│  ✅ Can now use imageUrl in:                                        │
│     • Product database                                              │
│     • User profile                                                  │
│     • Display in frontend                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow (Step by Step)

### 1. Client Side
```
User selects image → Click Upload → HTTP POST request
                                     with multipart/form-data
```

### 2. Spring Boot Controller
```
Receive request → Validate parameters → Call Service
```

### 3. Service Layer
```
Validate file type → Generate UUID → Prepare S3 request
     ↓
Upload to S3 → Get public URL → Return URL
```

### 4. AWS S3
```
Receive file → Store in bucket → Generate public URL
                                 (if bucket is public)
```

### 5. Response Flow
```
S3 URL → Service → Controller → JSON Response → Client
```

## Data Flow Example

### Input (Client → Server):
```http
POST /api/images/upload HTTP/1.1
Host: localhost:8080
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="product.jpg"
Content-Type: image/jpeg

[Binary Image Data]
------WebKitFormBoundary--
```

### Processing (Server → S3):
```
1. Validate: image/jpeg ✅
2. Generate: UUID = 550e8400-e29b-41d4-a716-446655440000
3. Create key: images/550e8400-e29b-41d4-a716-446655440000.jpg
4. Upload to S3 bucket
5. Get URL: https://my-bucket.s3.ap-southeast-1.amazonaws.com/images/[uuid].jpg
```

### Output (Server → Client):
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "message": "Image uploaded successfully",
    "imageUrl": "https://my-bucket.s3.ap-southeast-1.amazonaws.com/images/550e8400-e29b-41d4-a716-446655440000.jpg",
    "fileName": "product.jpg",
    "fileSize": 245678
}
```

## Component Responsibilities

### ImageUploadController
- ✅ Handle HTTP requests
- ✅ Validate request parameters
- ✅ Call service methods
- ✅ Format JSON responses
- ✅ Handle exceptions

### ImageUploadService
- ✅ Business logic
- ✅ File validation
- ✅ UUID generation
- ✅ S3 client interaction
- ✅ URL generation

### S3Config
- ✅ Configure AWS credentials
- ✅ Set up S3 client bean
- ✅ Configure region
- ✅ Dependency injection

### AWS S3
- ✅ Store files
- ✅ Serve files publicly
- ✅ Generate URLs
- ✅ File management

## Error Handling Flow

```
Client Request
     ↓
┌────────────────────┐
│ Is file empty?     │ → YES → Return 400 Bad Request
└────────────────────┘       "File is empty"
     ↓ NO
┌────────────────────┐
│ Is file an image?  │ → NO → Return 400 Bad Request
└────────────────────┘      "File must be an image"
     ↓ YES
┌────────────────────┐
│ Upload to S3       │ → FAIL → Return 500 Internal Error
└────────────────────┘         "Failed to upload to S3"
     ↓ SUCCESS
┌────────────────────┐
│ Return 200 OK      │
│ with image URL     │
└────────────────────┘
```

## Integration Points

### 1. Product Service Integration
```java
Product product = productService.findById(id);
String imageUrl = imageUploadService.uploadImage(file);
product.setImageUrl(imageUrl);
productService.save(product);
```

### 2. Product Details Integration
```java
String[] urls = imageUploadService.uploadMultipleImages(files);
productDetails.setImgList(String.join(",", urls));
```

### 3. User Profile Integration
```java
String profilePicUrl = imageUploadService.uploadImage(file);
user.setProfilePictureUrl(profilePicUrl);
```

## File Structure

```
OJT_backenddev/
├── src/main/java/com/tanxuan/demoaws/
│   ├── config/
│   │   └── S3Config.java ← AWS S3 Configuration
│   ├── controller/
│   │   └── ImageUploadController.java ← REST API Endpoints
│   ├── service/
│   │   └── ImageUploadService.java ← Upload Logic
│   └── ...
├── src/main/resources/
│   └── application.properties ← AWS Credentials & Config
├── pom.xml ← Dependencies (includes AWS S3 SDK)
└── Documentation/
    ├── S3_IMAGE_UPLOAD_README.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── QUICK_START_TESTING.md
    ├── COMPLETE_SUMMARY.md
    └── SYSTEM_FLOW.md (this file)
```

## Configuration Flow

```
Environment Variables (.env)
     ↓
application.properties
     ↓
S3Config.java (@Bean)
     ↓
ImageUploadService (Autowired)
     ↓
ImageUploadController (Autowired)
     ↓
REST API Endpoints
```

## Testing Flow

```
1. Create S3 Bucket (AWS Console)
2. Update application.properties (bucket name)
3. Start Spring Boot Application
4. Open Postman
5. POST /api/images/upload
6. Select image file
7. Send request
8. Receive JSON response with imageUrl
9. Open imageUrl in browser
10. ✅ See uploaded image
```

## Summary

This system provides:
- ✅ Simple POST endpoint for image upload
- ✅ Automatic UUID filename generation
- ✅ Direct S3 storage
- ✅ Public URL generation
- ✅ Error handling
- ✅ Multiple image support
- ✅ Delete functionality
- ✅ Easy integration with existing code

All components are ready and waiting for you to:
1. Build the project (download S3 SDK)
2. Create S3 bucket
3. Test and use!

---

**Ready to upload images to AWS S3!** 🚀

