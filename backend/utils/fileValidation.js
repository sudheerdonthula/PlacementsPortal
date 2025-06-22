const path = require('path');
const fs = require('fs');

// Get file type category based on extension
const getFileTypeCategory = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  const typeMap = {
    '.pdf': 'jd',
    '.doc': 'jd', 
    '.docx': 'jd',
    '.xls': 'ctc',
    '.xlsx': 'ctc',
    '.ppt': 'company-info',
    '.pptx': 'company-info',
    '.jpg': 'logo',
    '.jpeg': 'logo',
    '.png': 'logo',
    '.gif': 'logo',
    '.txt': 'other'
  };
  
  return typeMap[ext] || 'other';
};

// Get file size in readable format
const getReadableFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Validate file exists
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Delete file safely
const deleteFile = (filePath) => {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  getFileTypeCategory,
  getReadableFileSize,
  fileExists,
  deleteFile
};
