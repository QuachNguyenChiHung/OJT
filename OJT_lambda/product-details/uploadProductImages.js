// Lambda: Upload Product Images - MySQL
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getOne, update } = require('./shared/database');
const { successResponse, errorResponse, getPathParam } = require('./shared/response');
const Busboy = require('busboy');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ojt-ecommerce-images-706302944148';
const MAX_IMAGES = 5;

// Parse multipart form data
const parseMultipart = (event) => {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      // Try JSON body
      try {
        const body = JSON.parse(event.body || '{}');
        resolve({ images: body.images || [], isJson: true });
      } catch (e) {
        resolve({ images: [], isJson: false });
      }
      return;
    }

    const busboy = Busboy({ headers: { 'content-type': contentType } });
    const files = [];
    
    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        if (chunks.length > 0) {
          files.push({
            fieldname,
            filename,
            mimeType,
            buffer: Buffer.concat(chunks)
          });
        }
      });
    });
    
    busboy.on('finish', () => resolve({ files, isJson: false }));
    busboy.on('error', reject);
    
    const body = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body);
    busboy.end(body);
  });
};

exports.handler = async (event) => {
  try {
    const pdId = getPathParam(event, 'id');

    if (!pdId) {
      return errorResponse('Product details ID is required', 400);
    }

    // Parse request body (multipart or JSON)
    const parsed = await parseMultipart(event);
    let imagesToUpload = [];
    
    if (parsed.isJson && parsed.images) {
      // JSON format: { images: [{ data: base64, contentType }] }
      imagesToUpload = parsed.images.filter(img => img && img.data);
    } else if (parsed.files) {
      // Multipart format
      imagesToUpload = parsed.files.filter(f => f.buffer && f.buffer.length > 0);
    }

    if (imagesToUpload.length === 0) {
      return errorResponse('At least 1 image is required', 400);
    }
    
    if (imagesToUpload.length > MAX_IMAGES) {
      return errorResponse(`Maximum ${MAX_IMAGES} images allowed`, 400);
    }

    // Get existing product details - Schema v2
    const selectSql = `SELECT img_list FROM ProductDetails WHERE pd_id = ?`;
    const row = await getOne(selectSql, [pdId]);

    if (!row) {
      return errorResponse('Product details not found', 404);
    }

    // Parse existing images
    let existingUrls = [];
    if (row.img_list) {
      try {
        existingUrls = JSON.parse(row.img_list);
      } catch (e) {
        existingUrls = [];
      }
    }

    // Upload new images to S3
    const newUrls = [...existingUrls]; // Start with existing
    
    for (let i = 0; i < imagesToUpload.length; i++) {
      const image = imagesToUpload[i];
      let buffer, contentType;
      
      if (parsed.isJson) {
        // JSON format
        buffer = Buffer.from(image.data, 'base64');
        contentType = image.contentType || 'image/jpeg';
      } else {
        // Multipart format
        buffer = image.buffer;
        contentType = image.mimeType || 'image/jpeg';
      }
      
      if (buffer && buffer.length > 0) {
        const key = `products/${pdId}/${Date.now()}-${i}.jpg`;

        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }));

        const imageUrl = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${key}`;
        
        // Add to list (replace if position exists, otherwise append)
        if (i < newUrls.length) {
          // Delete old image if replacing
          if (newUrls[i]) {
            try {
              const oldKey = newUrls[i].split('.amazonaws.com/')[1];
              if (oldKey) {
                await s3Client.send(new DeleteObjectCommand({
                  Bucket: BUCKET_NAME,
                  Key: oldKey,
                }));
              }
            } catch (e) {
              console.error('Failed to delete old image:', e);
            }
          }
          newUrls[i] = imageUrl;
        } else {
          newUrls.push(imageUrl);
        }
      }
    }
    
    // Limit to MAX_IMAGES
    const finalUrls = newUrls.slice(0, MAX_IMAGES).filter(url => url);

    // Update database - Schema v2
    const imgListJson = JSON.stringify(finalUrls);
    const updateSql = `UPDATE ProductDetails SET img_list = ? WHERE pd_id = ?`;
    await update(updateSql, [imgListJson, pdId]);

    return successResponse({
      success: true,
      message: `${imagesToUpload.length} image(s) uploaded successfully`,
      productDetailsId: pdId,
      imageUrls: finalUrls,
    });
  } catch (error) {
    console.error('Upload product images error:', error);
    return errorResponse('Failed to upload images', 500);
  }
};
