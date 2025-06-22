const express = require('express');
const {
  createJobOffer,
  getAllJobOffers,
  getJobOffer,
  getCompanyJobOffers,
  updateJobOffer,
  deleteJobOffer
} = require('../controllers/jobOfferController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes (for students to view)
router.get('/', getAllJobOffers);


// Company routes
router.post('/', protect, authorize('company'), upload.array('documents', 5), createJobOffer);
router.get('/company', protect, authorize('company'), getCompanyJobOffers);
router.route('/:id/manage')
  .put(protect, authorize('company'), upload.array('documents', 5), updateJobOffer)
  .delete(protect, authorize('company'), deleteJobOffer);

// Student routes
router.get('/:id', getJobOffer);

// Error handling middleware for file uploads
router.use(handleUploadError);

module.exports = router;
