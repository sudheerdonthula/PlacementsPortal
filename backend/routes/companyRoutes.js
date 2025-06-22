const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  createCompanyProfile,
  getCompanyProfile,
  getAllCompanies,
  verifyCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Company profile routes
router.route('/profile')
  .post(protect, authorize('company'), createCompanyProfile)
  .get(protect, authorize('company'), getCompanyProfile);

// Admin only routes
router.get('/all', protect, authorize('admin'), getAllCompanies);
router.put('/verify/:companyId', protect, authorize('admin'), verifyCompany);

// Serve company documents (accessible to company, admin, and optionally student)
router.get('/documents/:filename', protect, authorize('company', 'admin', 'student'), (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'documents', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set headers for PDF or other files
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving document'
    });
  }
});

module.exports = router;