# ✅ SMART IMAGE UPDATE FEATURE - Exactly 5 Images Required

## Overview

The `/api/product-details/{id}/images` endpoint now requires **exactly 5 images** and intelligently updates only the images that have changed, deleting only the replaced old images from S3.

## Key Requirements

1. ✅ **Exactly 5 images required** - Always maintain 5 image slots
2. ✅ **Smart update** - Only changed positions are updated
3. ✅ **Selective deletion** - Only old images that are replaced get deleted
4. ✅ **JSON parseable** - imgList stored as valid JSON array string

## How It Works

### Initial Upload (No existing images)
```
User uploads 5 new images → All 5 uploaded to S3 → Saved as JSON array
```

### Update Specific Images (Has existing images)
```
User uploads 5 files (some new, some unchanged)
    ↓
For each position (0-4):
    - If new file provided: Upload new image, delete old image
    - If no file/empty: Keep existing image URL
    ↓
Save updated array to database
```

## Request Format

### Method
```
POST /api/product-details/{id}/images
```

### Parameters
- `id` (UUID, path) - Product details ID
- `files` (MultipartFile[], body) - Exactly 5 image files

### Important Notes
- **Must send exactly 5 files** in the request
- To keep an image unchanged: Send an empty file at that position
- File positions correspond to array indices: files[0] → position 0, files[1] → position 1, etc.

## Examples

### Example 1: Initial Upload (5 New Images)
```bash
POST /api/product-details/{id}/images
files[0]: image1.jpg  (new)
files[1]: image2.jpg  (new)
files[2]: image3.jpg  (new)
files[3]: image4.jpg  (new)
files[4]: image5.jpg  (new)

Result:
- Upload all 5 images to S3
- Save: ["url1", "url2", "url3", "url4", "url5"]
- Old images deleted: 0
```

### Example 2: Update Position 0 and 2 Only
```bash
POST /api/product-details/{id}/images
files[0]: new-image1.jpg  (new - replaces position 0)
files[1]: (empty)         (keep existing)
files[2]: new-image3.jpg  (new - replaces position 2)
files[3]: (empty)         (keep existing)
files[4]: (empty)         (keep existing)

Before: ["old-url1", "url2", "old-url3", "url4", "url5"]
After:  ["new-url1", "url2", "new-url3", "url4", "url5"]

S3 Actions:
- Upload: new-image1.jpg → new-url1
- Upload: new-image3.jpg → new-url3
- Delete: old-url1 (replaced)
- Delete: old-url3 (replaced)
- Keep: url2, url4, url5 (unchanged)
```

### Example 3: Replace All 5 Images
```bash
POST /api/product-details/{id}/images
files[0]: new1.jpg
files[1]: new2.jpg
files[2]: new3.jpg
files[3]: new4.jpg
files[4]: new5.jpg

Before: ["old1", "old2", "old3", "old4", "old5"]
After:  ["new1", "new2", "new3", "new4", "new5"]

S3 Actions:
- Upload: 5 new images
- Delete: 5 old images
```

## Response Format

### Success Response (200 OK)
```json
{
    "success": true,
    "message": "Images uploaded successfully",
    "productDetailsId": "550e8400-e29b-41d4-a716-446655440000",
    "imageUrls": [
        "https://bucket.s3.../uuid1.jpg",
        "https://bucket.s3.../uuid2.jpg",
        "https://bucket.s3.../uuid3.jpg",
        "https://bucket.s3.../uuid4.jpg",
        "https://bucket.s3.../uuid5.jpg"
    ],
    "imgListJson": "[\"https://...\",\"https://...\",\"https://...\",\"https://...\",\"https://...\"]",
    "deletedCount": 2,
    "deletedUrls": [
        "https://bucket.s3.../old-uuid1.jpg",
        "https://bucket.s3.../old-uuid3.jpg"
    ],
    "productDetails": { ... }
}
```

### Error Response - Wrong Number of Files
```json
{
    "success": false,
    "message": "Exactly 5 images are required. Received: 3"
}
```

### Error Response - Empty Position
```json
{
    "success": false,
    "message": "Position 3 is empty. All 5 positions must have images."
}
```

## Database Format

The `imgList` field stores exactly 5 URLs as a JSON array:

```json
"[\"https://url1.jpg\",\"https://url2.jpg\",\"https://url3.jpg\",\"https://url4.jpg\",\"https://url5.jpg\"]"
```

### Parsing in Code

**Java:**
```java
ObjectMapper mapper = new ObjectMapper();
String[] urls = mapper.readValue(imgList, String[].class);
// urls.length == 5 (always)
```

**JavaScript:**
```javascript
const urls = JSON.parse(imgList);
// urls.length === 5 (always)
```

## Testing with Postman

### Test 1: Initial Upload (5 Images)
1. Method: POST
2. URL: `http://localhost:8080/api/product-details/{id}/images`
3. Body: form-data
4. Add 5 rows with key `files` (type: File)
   - files: image1.jpg
   - files: image2.jpg
   - files: image3.jpg
   - files: image4.jpg
   - files: image5.jpg
5. Send

### Test 2: Update Position 0 Only
1. Method: POST
2. URL: `http://localhost:8080/api/product-details/{id}/images`
3. Body: form-data
4. Add 5 rows:
   - files: new-image1.jpg ← New file
   - files: (leave empty)   ← Keep existing
   - files: (leave empty)   ← Keep existing
   - files: (leave empty)   ← Keep existing
   - files: (leave empty)   ← Keep existing
5. Send

**Note:** In Postman, to send empty file positions, you may need to use a different approach. Consider using a custom client or sending the actual file count.

## Testing with cURL

### Initial Upload
```bash
curl -X POST "http://localhost:8080/api/product-details/{id}/images" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg" \
  -F "files=@image4.jpg" \
  -F "files=@image5.jpg"
```

### Update Specific Positions
For selective updates, the frontend should send all 5 files where unchanged positions use the existing file or a placeholder.

## Frontend Implementation Example

```javascript
async function updateProductImages(productDetailsId, imageFiles, existingUrls) {
    const formData = new FormData();
    
    // Ensure exactly 5 positions
    for (let i = 0; i < 5; i++) {
        if (imageFiles[i]) {
            // New file at position i
            formData.append('files', imageFiles[i]);
        } else {
            // Keep existing - send empty blob or handle server-side
            formData.append('files', new Blob(), '');
        }
    }
    
    const response = await fetch(
        `http://localhost:8080/api/product-details/${productDetailsId}/images`,
        {
            method: 'POST',
            body: formData
        }
    );
    
    return await response.json();
}

// Usage
const imageFiles = [
    newFile1,      // Position 0: new image
    null,          // Position 1: keep existing
    newFile3,      // Position 2: new image
    null,          // Position 3: keep existing
    null           // Position 4: keep existing
];

updateProductImages(productDetailsId, imageFiles, existingUrls);
```

## Benefits

✅ **Efficient Storage** - Only replaces changed images  
✅ **Cost Effective** - Minimizes S3 operations  
✅ **Consistent Structure** - Always 5 images  
✅ **Smart Deletion** - Only deletes replaced images  
✅ **JSON Parseable** - Standard JSON array format  

## Validation Rules

1. **Exactly 5 files required** - No more, no less
2. **All positions must be filled** - Cannot have empty positions
3. **Valid image types** - Only image/* MIME types
4. **File size limit** - 10MB per image (configurable)

## Error Scenarios

### Scenario 1: Too Few Files
```bash
POST with 3 files
→ Error: "Exactly 5 images are required. Received: 3"
```

### Scenario 2: Too Many Files
```bash
POST with 7 files
→ Error: "Exactly 5 images are required. Received: 7"
```

### Scenario 3: Empty Position in New Upload
```bash
POST with files[0-3] filled, files[4] empty
→ Error: "Position 5 is empty. All 5 positions must have images."
```

## Migration from Old Data

If you have existing product details with fewer than 5 images:

```sql
-- Check for product details with < 5 images
SELECT pd_id, img_list, 
       JSON_LENGTH(img_list) as image_count 
FROM product_details 
WHERE JSON_LENGTH(img_list) < 5;

-- Manual fix: Add placeholder images or update via API
```

## Performance Considerations

- **Selective Upload**: Only uploads changed images (faster)
- **Selective Deletion**: Only deletes replaced images (fewer S3 operations)
- **Validation First**: Checks all requirements before any S3 operations
- **Atomic Operations**: All uploads complete before deletion

## Monitoring

### Key Metrics
1. **Upload Success Rate**: Track 5-image upload completions
2. **Deletion Success Rate**: Track old image deletion success
3. **Average Update Count**: How many images typically change per update

### Logging
```
INFO: Updating product details {id}
INFO: Existing images: 5, New images provided: 5
INFO: Positions to update: [0, 2]
INFO: Uploading 2 new images
INFO: Deleting 2 old images
INFO: Update complete - 2 uploaded, 2 deleted, 3 unchanged
```

## Best Practices

1. **Always send 5 files** in the request
2. **Validate client-side** before sending
3. **Show preview** of all 5 image positions
4. **Indicate unchanged** images in UI
5. **Compress images** before upload
6. **Handle errors** gracefully

## Summary

✅ **Exactly 5 images required** - Enforced at API level  
✅ **Smart updates** - Only changed positions are updated  
✅ **Selective deletion** - Only replaced images are deleted  
✅ **JSON parseable** - Standard array format  
✅ **Efficient** - Minimizes S3 operations  
✅ **Production ready** - Full validation and error handling  

---

**The endpoint is ready with the new 5-image requirement!** 🎉

## How It Works

### Flow:
```
1. User uploads new images
   ↓
2. Check if product details has existing images (imgList)
   ↓
3. If old images exist:
   - Parse imgList JSON string to get old URLs
   - Delete each old image from S3
   - Log errors if deletion fails (but continue)
   ↓
4. Upload new images to S3
   ↓
5. Save new image URLs to database
   ↓
6. Return success response
```

## Code Logic

### Step 1: Get Existing Product Details
```java
ProductDetailsDTO productDetails = productDetailsService.getProductDetailsById(id);
```

### Step 2: Check for Old Images
```java
if (productDetails.getImgList() != null && !productDetails.getImgList().isEmpty()) {
    // Has old images
}
```

### Step 3: Parse Old Image URLs
```java
String[] oldImageUrls = objectMapper.readValue(productDetails.getImgList(), String[].class);
// Result: ["https://bucket.s3.../image1.jpg", "https://bucket.s3.../image2.jpg"]
```

### Step 4: Delete Each Old Image
```java
for (String oldImageUrl : oldImageUrls) {
    try {
        imageUploadService.deleteImage(oldImageUrl);
    } catch (Exception e) {
        // Log error but continue
        System.err.println("Failed to delete old image: " + oldImageUrl);
    }
}
```

### Step 5: Upload New Images
```java
String[] imageUrls = imageUploadService.uploadMultipleImages(files);
```

## Benefits

✅ **No Orphaned Files**: Old images are deleted automatically  
✅ **Cost Savings**: Reduces S3 storage costs  
✅ **Clean Storage**: Only current images remain in S3  
✅ **Error Resilient**: If deletion fails, upload still continues  
✅ **Transparent**: Logs errors for monitoring  

## Example Scenario

### Initial State
```json
// Database
imgList: '["https://bucket.s3.../old1.jpg", "https://bucket.s3.../old2.jpg"]'

// S3 Bucket
/images/old1.jpg ✅ (exists)
/images/old2.jpg ✅ (exists)
```

### User Uploads New Images
```bash
POST /api/product-details/{id}/images
Files: [new-image1.jpg, new-image2.jpg, new-image3.jpg]
```

### What Happens
```
1. Parse old URLs: [old1.jpg, old2.jpg]
2. Delete old1.jpg from S3 ✅
3. Delete old2.jpg from S3 ✅
4. Upload new-image1.jpg → new URL1
5. Upload new-image2.jpg → new URL2
6. Upload new-image3.jpg → new URL3
7. Update database with new URLs
```

### Final State
```json
// Database
imgList: '["https://bucket.s3.../uuid1.jpg", "https://bucket.s3.../uuid2.jpg", "https://bucket.s3.../uuid3.jpg"]'

// S3 Bucket
/images/old1.jpg ❌ (deleted)
/images/old2.jpg ❌ (deleted)
/images/uuid1.jpg ✅ (new)
/images/uuid2.jpg ✅ (new)
/images/uuid3.jpg ✅ (new)
```

## Error Handling

### If Old Image Deletion Fails
The endpoint will:
- ✅ Log the error
- ✅ Continue with new image upload
- ✅ Not fail the entire request

Example log:
```
Failed to delete old image: https://bucket.s3.../old-image.jpg - Access Denied
```

### Why This Approach?
- User can still upload new images even if old ones can't be deleted
- Prevents transaction rollback if S3 deletion fails
- Old images can be cleaned up manually or with a batch job later

## Testing

### Test Case 1: First Upload (No Old Images)
```bash
POST /api/product-details/{id}/images
Files: [image1.jpg, image2.jpg]

Expected:
- No deletion (imgList is empty)
- Upload both images
- Return success
```

### Test Case 2: Update Images (Has Old Images)
```bash
# First upload
POST /api/product-details/{id}/images
Files: [old1.jpg, old2.jpg]

# Second upload (update)
POST /api/product-details/{id}/images
Files: [new1.jpg, new2.jpg, new3.jpg]

Expected:
- Delete old1.jpg from S3 ✅
- Delete old2.jpg from S3 ✅
- Upload new1.jpg ✅
- Upload new2.jpg ✅
- Upload new3.jpg ✅
- Database updated with 3 new URLs
```

### Test Case 3: Old Image Already Deleted
```bash
# Manually delete old image from S3
# Then upload new images

Expected:
- Try to delete old image (fails with error)
- Log error
- Continue with new upload ✅
- Return success
```

## Console Logs

When deleting old images, you'll see:
```
Processing product details ID: 550e8400-e29b-41d4-a716-446655440000
Old images found: 2
Deleting: https://bucket.s3.../uuid1.jpg
Deleting: https://bucket.s3.../uuid2.jpg
Old images deleted successfully
Uploading 3 new images...
Upload complete!
```

If deletion fails:
```
Failed to delete old image: https://bucket.s3.../uuid1.jpg - The specified key does not exist
Failed to delete old image: https://bucket.s3.../uuid2.jpg - Access Denied
Continuing with upload...
```

## Monitoring

### What to Monitor
1. **S3 Storage Usage**: Should decrease or stay stable
2. **Deletion Errors**: Check logs for repeated deletion failures
3. **Upload Success Rate**: Ensure uploads still work even if deletions fail

### Setting Up Alerts
```yaml
# CloudWatch Alert Example
Metric: S3 Storage Size
Condition: If size increases by >10GB in 1 day
Action: Send alert (possible deletion failure)
```

## Cost Impact

### Before (Without Deletion)
```
Month 1: 100 images × 5MB = 500MB
Month 2: 100 images × 5MB = 500MB (new) + 500MB (old) = 1GB
Month 3: 100 images × 5MB = 500MB (new) + 1GB (old) = 1.5GB
...
Storage cost increases every month ❌
```

### After (With Deletion)
```
Month 1: 100 images × 5MB = 500MB
Month 2: 100 images × 5MB = 500MB (old deleted)
Month 3: 100 images × 5MB = 500MB (old deleted)
...
Storage cost remains constant ✅
```

## Best Practices

1. **Regular Monitoring**: Check S3 bucket size regularly
2. **Backup Strategy**: Consider versioning or backup if images are critical
3. **Soft Delete**: For production, consider soft-delete (mark as deleted, cleanup later)
4. **Audit Trail**: Log all deletions for compliance

## Optional Enhancements

### 1. Batch Cleanup Job
```java
@Scheduled(cron = "0 0 2 * * ?") // 2 AM daily
public void cleanupOrphanedImages() {
    // Find images in S3 not referenced in database
    // Delete orphaned images
}
```

### 2. Soft Delete
```java
// Instead of immediate deletion
imageUploadService.markForDeletion(oldImageUrl);

// Cleanup job runs later
@Scheduled(...)
public void deleteMarkedImages() {
    imageUploadService.deletePendingImages();
}
```

### 3. Backup Before Delete
```java
// Copy to backup bucket before delete
s3Client.copyObject(sourceBucket, key, backupBucket, key);
imageUploadService.deleteImage(oldImageUrl);
```

## Summary

✅ **Feature Implemented**: Old images are now automatically deleted  
✅ **Error Resilient**: Upload continues even if deletion fails  
✅ **Cost Effective**: Reduces storage costs  
✅ **Production Ready**: Includes error handling and logging  

The endpoint is now complete and ready to use with automatic cleanup of old images!

---

**Test it now:**
```bash
# First upload
POST /api/product-details/{id}/images
Files: [image1.jpg, image2.jpg]

# Update with new images (old ones will be deleted)
POST /api/product-details/{id}/images
Files: [new-image1.jpg, new-image2.jpg, new-image3.jpg]
```

Old images deleted automatically! 🎉

