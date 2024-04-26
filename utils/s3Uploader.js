const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/awsConfig');
const crypto = require('crypto');



//upload
async function uploadFileToS3(fileBuffer, bucketName, originalFileName, mimeType) {
    // Generate a unique key using crypto
    const uniqueKey = crypto.randomBytes(16).toString('hex');
    const fileExtension = originalFileName.split('.').pop();
    const key = `${uniqueKey}.${fileExtension}`;
  
    try {
      const uploader = new Upload({
        client: s3Client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
          ACL: 'public-read'
        },
      });
  
      const result = await uploader.done();
      return { ...result, key }; // Include the key in the response for easier reference
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  



//delete
async function deleteFileFromS3(bucketName, key) {
  const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
  });

  try {
      const response = await s3Client.send(command);
      return response; // Indicates successful deletion
  } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
  }
}




//update
async function updateFileInS3(fileBuffer, bucketName, key, mimeType) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read'
      });
      await s3Client.send(command);
      return { success: true, message: 'File successfully updated' };
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
}
  
module.exports = {
    uploadFileToS3, deleteFileFromS3,
    updateFileInS3
};