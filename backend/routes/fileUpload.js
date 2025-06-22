const express = require('express');
const router = express.Router();
const { upload, handleUploadError, uploadToCloudinary } = require('../middleware/uploadMiddleware');
const { getFileTypeCategory, getReadableFileSize } = require('../utils/fileValidation');

// POST - Upload files to Cloudinary
router.post('/upload', upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Upload each file to Cloudinary
    const uploadedFiles = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'documents');
      uploadedFiles.push({
        filename: file.originalname,
        url: result.secure_url,
        public_id: result.public_id,
        type: getFileTypeCategory(file.originalname),
        size: getReadableFileSize(file.size),
        uploadDate: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// Error handling middleware
router.use(handleUploadError);

module.exports = router;
