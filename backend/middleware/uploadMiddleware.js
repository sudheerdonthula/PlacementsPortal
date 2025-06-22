const multer = require("multer");
const path = require("path");
const streamifier = require("streamifier");
const cloudinary = require("../utils/cloudinary");

// File filter for allowed types
const allowedMimeTypes = [
  "application/pdf", // PDF
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/vnd.ms-powerpoint", // PPT
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "image/jpeg", // JPG
  "image/jpg", // JPG
  "image/png", // PNG
  "image/gif", // GIF
  "text/plain", // TXT
];

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".txt",
];

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}`
      ),
      false
    );
  }
};

// Use memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
    files: 5, // Maximum 5 files per upload
  },
  fileFilter: fileFilter,
});

// Cloudinary upload helper
const uploadToCloudinary = (fileBuffer, originalname, folder = "documents") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Always use "raw" for non-image files
        folder,
        public_id: originalname, // use original filename with extension
        use_filename: true,
        unique_filename: false, // keep the extension in the URL
        overwrite: true,
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 30MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 5 files allowed.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
  }

  if (
    error &&
    error.message &&
    error.message.includes("File type not allowed")
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Generic error
  return res.status(500).json({
    success: false,
    message: "File upload failed: " + (error?.message || "Unknown error"),
  });
};

module.exports = {
  upload,
  uploadToCloudinary,
  handleUploadError,
};
