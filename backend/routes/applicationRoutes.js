const express = require('express');
const {
  applyForJob,
  getStudentApplications,
  getJobApplications,
  updateApplicationStage,
  getAllApplications,
  getRoundApplications,
  bulkUpdateApplications,
  advanceToNextRound,
  completeHiring,
  checkApplicationStatus,
  pushToNextRound,
  rejectSelected
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.post('/apply/:jobId', protect, authorize('student'), applyForJob);
router.get('/my-applications', protect, authorize('student'), getStudentApplications);
router.get('/check/:jobId', protect, authorize('student'), checkApplicationStatus);

// Company routes
router.get('/job/:jobOfferId', protect, authorize('company'), getJobApplications);
router.get('/job/:jobOfferId/round/:roundNumber', protect, authorize('company'), getRoundApplications);

// NEW ROUTES - Main workflow
router.post('/job/:jobOfferId/push-to-next-round', protect, authorize('company'), pushToNextRound);
router.post('/job/:jobOfferId/reject-selected', protect, authorize('company'), rejectSelected);
router.post('/job/:jobOfferId/advance-round', protect, authorize('company'), advanceToNextRound);
router.post('/job/:jobOfferId/complete-hiring', protect, authorize('company'), completeHiring);

// OLD ROUTES - Kept for backward compatibility
router.put('/update-stage/:applicationId', protect, authorize('company'), updateApplicationStage);
router.patch('/bulk-update', protect, authorize('company'), bulkUpdateApplications);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllApplications);

module.exports = router;
