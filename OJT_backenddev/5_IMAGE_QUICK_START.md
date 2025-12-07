# 🚀 Quick Start - 5-Image Smart Update Feature

## What Changed

The `/api/product-details/{id}/images` endpoint now:
- ✅ Requires **exactly 5 images** (enforced)
- ✅ Only updates **changed positions**
- ✅ Only deletes **replaced old images**
- ✅ Stores images as **JSON-parseable array**

## Quick Test with Postman

### Test 1: Upload 5 Images (First Time)

1. **Method**: POST
2. **URL**: `http://localhost:8080/api/product-details/{YOUR-UUID}/images`
3. **Body**: form-data
4. Add **exactly 5 rows** with key `files` (type: File):
   ```
   files: image1.jpg
   files: image2.jpg
   files: image3.jpg
   files: image4.jpg
   files: image5.jpg
   ```
5. **Send**

**Expected Response:**
```json
{
    "success": true,
    "imageUrls": ["url1", "url2", "url3", "url4", "url5"],
    "imgListJson": "[\"url1\",\"url2\",\"url3\",\"url4\",\"url5\"]",
    "deletedCount": 0
}
```

### Test 2: Update Position 0 and 2 Only

1. Same endpoint
2. Add 5 rows:
   ```
   files: new-image1.jpg  ← NEW (replaces position 0)
   files: (empty)         ← KEEP existing
   files: new-image3.jpg  ← NEW (replaces position 2)
   files: (empty)         ← KEEP existing
   files: (empty)         ← KEEP existing
   ```
3. **Send**

**Expected Response:**
```json
{
    "success": true,
    "imageUrls": ["new-url1", "old-url2", "new-url3", "old-url4", "old-url5"],
    "deletedCount": 2,
    "deletedUrls": ["old-url1", "old-url3"]
}
```

## How It Works

### Flow Diagram
```
POST 5 files
    ↓
For each position (0-4):
    ├─ New file? 
    │   ├─ Yes: Upload new → Delete old (if exists)
    │   └─ No: Keep existing URL
    ↓
Save JSON array: ["url1", "url2", "url3", "url4", "url5"]
```

### Example Scenario

**Before Update:**
```json
imgList: '["old1.jpg", "old2.jpg", "old3.jpg", "old4.jpg", "old5.jpg"]'
```

**User Action:**
```
POST with:
- Position 0: new-image1.jpg (NEW)
- Position 1: (empty - keep)
- Position 2: new-image3.jpg (NEW)
- Position 3: (empty - keep)
- Position 4: (empty - keep)
```

**Result:**
```json
imgList: '["new1.jpg", "old2.jpg", "new3.jpg", "old4.jpg", "old5.jpg"]'
```

**S3 Actions:**
```
Upload: new1.jpg, new3.jpg (2 uploads)
Delete: old1.jpg, old3.jpg (2 deletions)
Keep: old2.jpg, old4.jpg, old5.jpg (3 unchanged)
```

## Common Scenarios

### Scenario 1: Replace All 5 Images
```
POST 5 new files
→ Upload 5 new images
→ Delete 5 old images
→ Result: All new URLs
```

### Scenario 2: Replace Only First Image
```
POST:
- files[0]: new.jpg
- files[1-4]: empty
→ Upload 1 new image
→ Delete 1 old image
→ Result: 1 new URL + 4 old URLs
```

### Scenario 3: Replace Middle 3 Images
```
POST:
- files[0]: empty
- files[1]: new2.jpg
- files[2]: new3.jpg
- files[3]: new4.jpg
- files[4]: empty
→ Upload 3 new images
→ Delete 3 old images
→ Result: old1, new2, new3, new4, old5
```

## Error Cases

### ❌ Wrong Number of Files
```bash
POST with 3 files
Response: {
    "success": false,
    "message": "Exactly 5 images are required. Received: 3"
}
```

### ❌ Empty Position on First Upload
```bash
POST (first time):
- files[0-3]: filled
- files[4]: empty
Response: {
    "success": false,
    "message": "Position 5 is empty. All 5 positions must have images."
}
```

## Database Format

The `imgList` field always contains **exactly 5 URLs** as a JSON array:

```sql
SELECT img_list FROM product_details WHERE pd_id = 'xxx';

Result:
'["https://url1.jpg","https://url2.jpg","https://url3.jpg","https://url4.jpg","https://url5.jpg"]'
```

### Parsing in Code

**Java:**
```java
String[] urls = objectMapper.readValue(imgList, String[].class);
// urls.length is always 5
```

**JavaScript:**
```javascript
const urls = JSON.parse(imgList);
// urls.length is always 5
```

## Benefits

✅ **Efficient**: Only uploads/deletes what changed  
✅ **Cost-effective**: Fewer S3 operations  
✅ **Consistent**: Always 5 images  
✅ **Safe**: Old images only deleted when replaced  
✅ **JSON-parseable**: Standard array format  

## Validation Checklist

Before sending request:
- [ ] Exactly 5 files prepared
- [ ] All positions have either new file or keep existing
- [ ] Each file is valid image type
- [ ] Each file is under 10MB
- [ ] Product details ID is valid UUID

## cURL Examples

### Initial Upload (5 new images)
```bash
curl -X POST "http://localhost:8080/api/product-details/{id}/images" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg" \
  -F "files=@image4.jpg" \
  -F "files=@image5.jpg"
```

### Replace All 5
```bash
curl -X POST "http://localhost:8080/api/product-details/{id}/images" \
  -F "files=@new1.jpg" \
  -F "files=@new2.jpg" \
  -F "files=@new3.jpg" \
  -F "files=@new4.jpg" \
  -F "files=@new5.jpg"
```

## Response Fields Explained

```json
{
    "success": true,                    // Operation status
    "message": "Images uploaded successfully",
    "productDetailsId": "uuid",         // Product details ID
    "imageUrls": ["url1", ...],         // Array of 5 final URLs
    "imgListJson": "[\"url1\",...]",   // JSON string for database
    "deletedCount": 2,                  // How many old images deleted
    "deletedUrls": ["old1", "old2"],   // Which old images deleted
    "productDetails": { ... }           // Updated product details
}
```

## Troubleshooting

### Issue: "Exactly 5 images are required"
**Cause**: Sent wrong number of files  
**Solution**: Always send exactly 5 files in the request

### Issue: "Position X is empty"
**Cause**: First upload with empty position  
**Solution**: All 5 positions must have images on first upload

### Issue: Old images not deleted
**Cause**: S3 deletion failed  
**Solution**: Check S3 permissions and bucket configuration

### Issue: Can't update selective images
**Cause**: Sending wrong file array  
**Solution**: Send all 5 files - use empty/null for unchanged positions

## Ready to Use!

1. ✅ Start your application
2. ✅ Get a product details UUID
3. ✅ Open Postman
4. ✅ POST 5 images to `/api/product-details/{id}/images`
5. ✅ Check response and verify S3 storage

---

**Feature is complete and ready!** 🎉

For detailed documentation, see: `OLD_IMAGE_DELETION_FEATURE.md`

