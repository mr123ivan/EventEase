package com.Project.Backend.Service;

import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.io.File;
import io.github.cdimascio.dotenv.Dotenv;
import java.time.Duration;

@Component
public class S3Service {

    private final String BUCKET_NAME = "planease-data-storage"; // Change this
    private final String BUCKET_KEY = "Showcase Media/";
    private S3Client s3;
    private final S3Presigner presigner;


    private S3Service() {
       
        Dotenv dotenv = Dotenv.configure().load();
        
        String accessKey = dotenv.get("AWS_ACCESS_KEY");
        String secretKey = dotenv.get("AWS_ACCESS_SECRET_KEY");
        String region = dotenv.get("AWS_REGION", "ap-southeast-1"); // default to ap-southeast-1 if not set

        if (accessKey == null || secretKey == null) {
            throw new IllegalArgumentException("AWS credentials are not set in environment variables or .env file");
        }

        this.s3 = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();

        this.presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
        
    }

    public String upload(File file, String folderPath, String fileName) {
        try {
            String s3Key = BUCKET_KEY + folderPath + java.util.UUID.randomUUID() + "_" + fileName;

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(s3Key)
                    .contentType(getContentType(fileName))
                    .build();

            // Step 3: Upload the file to S3
            s3.putObject(request, RequestBody.fromFile(file));

            // Step 4: Get the Object URL using AWS SDK's S3Utilities
            S3Utilities s3Utilities = s3.utilities();
            String objectUrl = s3Utilities.getUrl(builder ->
                    builder.bucket(BUCKET_NAME).key(s3Key)
            ).toString();

            return objectUrl;
        } catch (Exception e) {
            System.out.println("Error occurred while uploading the file to S3: " + e.getMessage());
            throw new RuntimeException("Error occurred while uploading the file to S3: " + e.getMessage(), e);
        }
    }

    public String getImage(String s3Key, String imagePath) {
        try {
            String fullS3Key = BUCKET_KEY + imagePath + "/" + s3Key;

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(fullS3Key)
                    .build();

            S3Utilities s3Utilities = s3.utilities();
            String objectUrl = s3Utilities.getUrl(builder ->
                    builder.bucket(BUCKET_NAME).key(fullS3Key)
            ).toString();

            return objectUrl; // Return the URL of the image
        } catch (Exception e) {
            System.err.println("Error fetching image: " + e.getMessage());
            return null; // Or handle error appropriately
        }
    }

    // Get Content Type Based on File Extension
    private static String getContentType(String fileName) {
        String lower = fileName.toLowerCase();

        if (lower.endsWith(".png")) {
            return "image/png";
        } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lower.endsWith(".gif")) {
            return "image/gif";
        } else if (lower.endsWith(".mp4")) {
            return "video/mp4";
        } else if (lower.endsWith(".mov")) {
            return "video/quicktime";
        } else if (lower.endsWith(".webm")) {
            return "video/webm";
        } else if (lower.endsWith(".avi")) {
            return "video/x-msvideo";
        } else if (lower.endsWith(".mkv")) {
            return "video/x-matroska";
        } else if (lower.endsWith(".mp3")) {
            return "audio/mpeg";
        } else if (lower.endsWith(".wav")) {
            return "audio/wav";
        } else {
            return "application/octet-stream"; // default fallback
        }
    }

    public String generatePresignedUploadUrl(String folderPath, String uuidName) {

        String s3Key = BUCKET_KEY + folderPath + uuidName;
        try {

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(s3Key)
                    .contentType(getContentType(uuidName))
                    .build();

            // Generate a pre-signed URL for uploading
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .putObjectRequest(putObjectRequest)
                    .signatureDuration(Duration.ofMinutes(15)) // URL expires in 15 minutes
                    .build();

            // Generate the pre-signed URL
            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);
            return presignedRequest.url().toString(); // Return the pre-signed URL
        } catch (SdkClientException e) {
            throw new RuntimeException("Error generating pre-signed URL: " + e.getMessage(), e);
        }
    }

}
