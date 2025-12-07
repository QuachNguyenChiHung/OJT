package com.tanxuan.demoaws.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
public class ImageUploadService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Value("${aws.region}")
    private String awsRegion;

    public ImageUploadService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Upload image to S3 bucket
     * @param file MultipartFile to upload
     * @return Public URL of the uploaded image
     */
    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Generate unique file name
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String fileName = "images/" + UUID.randomUUID() + extension;

        try {
            // Create PutObjectRequest with public-read ACL
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            // Upload file to S3
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            // Return public URL
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion, fileName);

        } catch (S3Exception e) {
            throw new RuntimeException("Failed to upload image to S3: " + e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage(), e);
        }
    }

    /**
     * Upload multiple images to S3
     * @param files Array of MultipartFiles
     * @return Array of public URLs
     */
    public String[] uploadMultipleImages(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("No files provided");
        }

        String[] urls = new String[files.length];
        for (int i = 0; i < files.length; i++) {
            urls[i] = uploadImage(files[i]);
        }
        return urls;
    }

    /**
     * Delete image from S3 bucket
     * @param imageUrl Full URL of the image
     */
    public void deleteImage(String imageUrl) {
        try {
            // Extract key from URL
            String key = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);

            s3Client.deleteObject(builder -> builder
                    .bucket(bucketName)
                    .key("images/" + key)
                    .build());
        } catch (S3Exception e) {
            throw new RuntimeException("Failed to delete image from S3: " + e.getMessage(), e);
        }
    }
}

