// Lambda: Upload Image to S3
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { verifyToken } = require('./shared/auth');
const { successResponse, errorResponse } = require('./shared/response');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    const user = await verifyToken(event);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = JSON.parse(event.body || '{}');
    const { fileName, fileContent, contentType } = body;

    if (!fileName || !fileContent) {
      return errorResponse('File name and content are required', 400);
    }

    // Generate unique file name
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExt}`;
    const key = `products/${uniqueFileName}`;

    // Decode base64 content
    const buffer = Buffer.from(fileContent, 'base64');

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'image/jpeg',
      ACL: 'public-read'
    });

    await s3Client.send(command);

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return successResponse({
      imageUrl,
      message: 'Image uploaded successfully'
    }, 201);

  } catch (error) {
    console.error('Upload image error:', error);
    return errorResponse(error.message || 'Failed to upload image', 500);
  }
};
