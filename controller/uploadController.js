const { uploadFileToS3, deleteFileFromS3, updateFileInS3} = require('../utils/s3Uploader');
const S3Client= require('@aws-sdk/client-s3');
const s3Client = require('../config/awsConfig');


//updateBucketPolicy('images-grabfood');
//upload
exports.uploadImageToS3 = async (req, res) => {
    if (!req.file) return res.status(400).send('File is required.');
  
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;
    const bucketName = process.env.S3_BUCKET_NAME;
  
    try {
      const uploadResult = await uploadFileToS3(fileBuffer, bucketName, fileName, mimeType);
      res.status(200).json({
        message: 'Upload successful',
        imageUrl: uploadResult.Location,
        key: uploadResult.key  // Return the key to the client
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
};
  


//delete
exports.deleteImageFromS3 = async (req, res) => {
  const key = req.params.key;
  const bucketName = process.env.S3_BUCKET_NAME;

  try {
    const result = await deleteFileFromS3(bucketName, key);
    res.status(200).json({ message: 'File deleted successfully', details: result });
  } catch (error) {
    console.error('Failed to delete file:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
};

exports.updateImageInS3 = async (req, res) => {
    const key = req.params.key;
    const file = req.file;

    try {
      const result = await updateFileInS3(file.buffer, process.env.S3_BUCKET, key, file.mimetype);
      res.json({ message: 'Image updated successfully', details: result });
    } catch (error) {
      console.error('Error updating image:', error);
      res.status(500).json({ message: 'Failed to update image', error: error.message });
    }
};