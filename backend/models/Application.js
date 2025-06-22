const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  jobOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOffer',
    required: true
  },
  currentRound: {
    type: Number,
    required: true,
    default: 1
  },
  totalRounds: {
    type: Number,
    required: true
  },
  applicationStatus: {
    type: String,
    enum: ['in-progress', 'accepted', 'rejected'],
    default: 'in-progress'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ studentId: 1, jobOfferId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
