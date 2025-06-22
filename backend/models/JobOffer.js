const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  ctc: {
    total: {
      type: Number,
      required: true
    },
    breakdown: {
      baseSalary: Number,
      bonus: Number,
      benefits: Number,
      other: Number
    }
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract'],
    default: 'full-time'
  },
  eligibilityCriteria: {
    minCGPA: Number,
    departments: [String],
    year: [Number],
    skills: [String]
  },
  recruitmentProcess: [{
    stageName: {
      type: String,
      required: true
    },
    stageOrder: {
      type: Number,
      required: true
    },
    date: Date,
    description: String
  }],
  totalRounds: {
    type: Number,
    required: true,
    default: function() {
      return this.recruitmentProcess ? this.recruitmentProcess.length : 0;
    }
  },
  currentRecruitmentStage: {
    type: Number,
    default: 1
  },
  currentApplicationCount: {
    type: Number,
    default: 0
  },
  // Updated documents schema for Cloudinary
  documents: [{
    filename: String,      // Original file name
    url: String,           // Cloudinary URL
    public_id: String,     // Cloudinary public_id
    type: {
      type: String,
      enum: ['jd', 'ctc', 'company-info', 'other','logo']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  applicationDeadline: {
    type: Date,
    required: true
  },
  jobStatus: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobOffer', jobOfferSchema);
