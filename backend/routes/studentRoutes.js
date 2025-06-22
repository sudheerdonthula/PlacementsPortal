const express = require('express');
const {
  createStudentProfile,
  getStudentProfile,
  getAllStudents,
  uploadResume
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Student profile routes
// Allow both 'student' and 'company' roles to GET profile (for viewing)
router.get('/profile', protect, authorize('student', 'company'), getStudentProfile);

// Only students can create/update their own profile
router.post('/profile', protect, authorize('student'), createStudentProfile);

// Only students can upload resumes (Cloudinary)
router.post('/resume', protect, authorize('student'), upload.single('resume'), uploadResume);

// Admin only route
router.get('/all', protect, authorize('admin'), getAllStudents);

module.exports = router;