# Product Details Image Upload Endpoint

## Overview
Upload/Update images for a specific product detail. Images are uploaded to AWS S3 and the URLs are stored as a JSON array string in the database.

## Endpoint

```
POST /api/product-details/{id}/images
```

## Parameters

### Path Parameter
- `id` (UUID, required) - The product details ID

### Request Body
- `files` (MultipartFile[], required) - Array of image files to upload

## Request Example

### Using Postman
1. Method: **POST**
2. URL: `http://localhost:8080/api/product-details/{id}/images`
   - Replace `{id}` with actual product details UUID
3. Body type: **form-data**
4. Add multiple rows with key: `files` (type: File)
   - Each row should have the same key name: `files`
   - Select different image files for each row

### Using cURL
```bash
curl -X POST "http://localhost:8080/api/product-details/550e8400-e29b-41d4-a716-446655440000/images" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "files=@/path/to/image3.jpg"
```

### Using HTTP Client (IntelliJ/VS Code)
```http
POST http://localhost:8080/api/product-details/550e8400-e29b-41d4-a716-446655440000/images
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="files"; filename="image1.jpg"
Content-Type: image/jpeg

< ./image1.jpg
------WebKitFormBoundary
Content-Disposition: form-data; name="files"; filename="image2.jpg"
Content-Type: image/jpeg

< ./image2.jpg
------WebKitFormBoundary--
```

## Response

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Images uploaded successfully",
    "productDetailsId": "550e8400-e29b-41d4-a716-446655440000",
    "imageUrls": [
        "https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid1.jpg",
        "https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid2.jpg",
        "https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid3.jpg"
    ],
    "imgListJson": "[\"https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid1.jpg\",\"https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid2.jpg\",\"https://your-bucket.s3.ap-southeast-1.amazonaws.com/images/uuid3.jpg\"]",
    "productDetails": {
        "pdId": "550e8400-e29b-41d4-a716-446655440000",
        "productId": "...",
        "colorName": "Red",
        "colorCode": "#FF0000",
        "size": "M",
        "amount": 100.00,
        "inStock": true,
        "imgList": "[\"https://...\",\"https://...\",\"https://...\"]"
    }
}
```

### Error Responses

#### 400 Bad Request - No files provided
```json
{
    "success": false,
    "message": "No files provided"
}
```

#### 400 Bad Request - Invalid file type
```json
{
    "success": false,
    "message": "File must be an image"
}
```

#### 404 Not Found - Product details not found
```json
{
    "success": false,
    "message": "Product details not found with id: ..."
}
```

#### 500 Internal Server Error - Upload failed
```json
{
    "success": false,
    "message": "Failed to upload images: [error details]"
}
```

## How It Works

1. **Receive Files**: Endpoint receives array of image files
2. **Upload to S3**: Each file is uploaded to AWS S3 with public-read ACL
3. **Get URLs**: S3 returns public URLs for each uploaded image
4. **Convert to JSON**: Array of URLs is converted to JSON string
   - Example: `["url1", "url2", "url3"]`
5. **Update Database**: JSON string is saved to `imgList` field in ProductDetails table
6. **Return Response**: Updated product details with image URLs

## Image URL Storage Format

The `imgList` field stores image URLs as a JSON array string:

```json
"[\"https://bucket.s3.region.amazonaws.com/images/uuid1.jpg\",\"https://bucket.s3.region.amazonaws.com/images/uuid2.jpg\"]"
```

This can be parsed back to an array:
```javascript
// JavaScript
const urls = JSON.parse(imgList);
// Result: ["https://...", "https://..."]
```

```java
// Java
ObjectMapper mapper = new ObjectMapper();
String[] urls = mapper.readValue(imgList, String[].class);
```

## Features

- ✅ Multiple image upload in one request
- ✅ Images uploaded to AWS S3 with public access
- ✅ Automatic UUID-based filename generation
- ✅ Image URLs stored as JSON array string
- ✅ Updates existing product details
- ✅ Validates file types (images only)
- ✅ File size limit: 10MB per file
- ✅ Returns complete updated product details

## Use Cases

### 1. Add Product Images
Upload multiple product images for a new product detail:
```bash
POST /api/product-details/{id}/images
Files: [front.jpg, back.jpg, side.jpg, detail.jpg]
```

### 2. Update Product Images
Replace existing images with new ones:
```bash
POST /api/product-details/{id}/images
Files: [new-image1.jpg, new-image2.jpg]
```
*Note: This replaces all existing images. Old image URLs will be overwritten.*

### 3. Add Single Image
Even though it accepts an array, you can upload just one image:
```bash
POST /api/product-details/{id}/images
Files: [single-image.jpg]
```

## Integration Example

### Frontend (React/JavaScript)
```javascript
async function uploadProductImages(productDetailsId, files) {
    const formData = new FormData();
    
    // Add all files with the same key name 'files'
    files.forEach(file => {
        formData.append('files', file);
    });
    
    const response = await fetch(
        `http://localhost:8080/api/product-details/${productDetailsId}/images`,
        {
            method: 'POST',
            body: formData
        }
    );
    
    const result = await response.json();
    
    if (result.success) {
        console.log('Uploaded URLs:', result.imageUrls);
        console.log('JSON string:', result.imgListJson);
    }
}

// Usage
const fileInput = document.getElementById('fileInput');
uploadProductImages('550e8400-e29b-41d4-a716-446655440000', fileInput.files);
```

### Backend (Java)
```java
// Parsing imgList back to array
@Service
public class ProductImageService {
    
    private final ObjectMapper objectMapper;
    
    public String[] getImageUrls(String imgListJson) throws JsonProcessingException {
        return objectMapper.readValue(imgListJson, String[].class);
    }
    
    public List<String> getImageUrlsList(ProductDetails productDetails) {
        try {
            String[] urls = objectMapper.readValue(
                productDetails.getImgList(), 
                String[].class
            );
            return Arrays.asList(urls);
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}
```

## Best Practices

1. **File Size**: Keep images under 10MB for optimal performance
2. **Image Format**: Use JPEG or PNG for best compatibility
3. **Image Count**: Recommend 3-5 images per product detail
4. **Image Optimization**: Compress images before upload to reduce storage costs
5. **Error Handling**: Always check `success` field in response
6. **Old Images**: Consider deleting old S3 images before uploading new ones to save storage costs

## Troubleshooting

### Issue: "No files provided"
**Solution:** Make sure you're sending files with the key name `files` (not `file`)

### Issue: "File must be an image"
**Solution:** Only image files (JPEG, PNG, GIF, etc.) are allowed

### Issue: "Product details not found"
**Solution:** Verify the product details UUID exists in the database

### Issue: Images upload but imgList is null
**Solution:** Check that ObjectMapper bean is properly configured in Spring context

### Issue: Can't view uploaded images
**Solution:** 
1. Ensure S3 bucket has ACLs enabled
2. Ensure images are uploaded with `public-read` ACL
3. Check bucket CORS configuration if accessing from browser

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images (2-5 images)
- [ ] Verify images are accessible via returned URLs
- [ ] Verify imgList is saved as valid JSON string
- [ ] Test with different image formats (JPG, PNG)
- [ ] Test error cases (no files, invalid product ID)
- [ ] Parse imgList JSON back to array successfully
- [ ] Verify old images are replaced when uploading new ones

## Next Steps

1. **Delete Old Images**: Add logic to delete old S3 images before uploading new ones
2. **Image Validation**: Add more strict validation (dimensions, aspect ratio, etc.)
3. **Image Optimization**: Automatically resize/compress images
4. **Progress Tracking**: Add upload progress for large files
5. **Batch Operations**: Create endpoint to upload images for multiple product details at once

---

**Endpoint is ready to use!** 🎉
Test it with Postman or see `test-product-details-images.http` for examples.

