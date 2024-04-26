const express = require('express');
const router = express.Router();
const uploadController = require('../controller/uploadController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.post('/upload', uploadMiddleware.single('file'), uploadController.uploadImageToS3);
router.delete('/delete/:key', uploadController.deleteImageFromS3);
router.post('/update/:key', uploadMiddleware.single('file'), uploadController.updateImageInS3);

module.exports = router;
