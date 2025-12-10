// Lambda: Upload Product Thumbnails - MySQL
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getOne, update } = require('./shared/database');
const { successResponse, errorResponse, getPathParam, parseBody } = require('./shared/response');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ojt-ecommerce-images-706302944148';

exports.handler = async (event) => {
  try {
    const productId = getPathParam(event, 'id');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // Check if product exists
    const product = await getOne('SELECT p_id FROM Product WHERE p_id = ?', [productId]);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const body = parseBody(event);
    const { thumbnail1, thumbnail2 } = body;

    if (!thumbnail1 && !thumbnail2) {
      return errorResponse('At least one thumbnail is required', 400);
    }

    let thumb1Url = null;
    let thumb2Url = null;

    // Upload thumbnail 1
    if (thumbnail1 && thumbnail1.data) {
      const buffer = Buffer.from(thumbnail1.data, 'base64');
      const key = `thumbnails/${productId}/thumb1-${Date.now()}.jpg`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: thumbnail1.contentType || 'image/jpeg',
      }));
      
      thumb1Url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${key}`;
    }

    // Upload thumbnail 2
    if (thumbnail2 && thumbnail2.data) {
      const buffer = Buffer.from(thumbnail2.data, 'base64');
      const key = `thumbnails/${productId}/thumb2-${Date.now()}.jpg`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: thumbnail2.contentType || 'image/jpeg',
      }));
      
      thumb2Url = `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${key}`;
    }

    // Update database
    let updateSql = 'UPDATE Product SET ';
    const params = [];
    
    if (thumb1Url) {
      updateSql += 'thumbnail_1 = ?';
      params.push(thumb1Url);
    }
    if (thumb2Url) {
      if (params.length > 0) updateSql += ', ';
      updateSql += 'thumbnail_2 = ?';
      params.push(thumb2Url);
    }
    updateSql += ' WHERE p_id = ?';
    params.push(productId);

    await update(updateSql, params);

    return successResponse({
      success: true,
      message: 'Thumbnails uploaded successfully',
      productId,
      thumbnail1: thumb1Url,
      thumbnail2: thumb2Url
    });
  } catch (error) {
    console.error('Upload thumbnails error:', error);
    return errorResponse('Failed to upload thumbnails: ' + error.message, 500);
  }
};
