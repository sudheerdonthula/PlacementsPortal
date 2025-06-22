const JobOffer = require('../models/JobOffer');
const Company = require('../models/Company');
const Application = require('../models/Application');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const { getFileTypeCategory } = require('../utils/fileValidation');

// Helper to upload a file buffer to Cloudinary (raw type for all docs)
const uploadToCloudinary = (fileBuffer, originalname, folder = "job-documents") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
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

// Create Job Offer (Company only) - Cloudinary for documents
const createJobOffer = async (req, res) => {
  try {
    // Parse jobData if it exists (from FormData)
    let jobData;
    if (req.body.jobData) {
      try {
        jobData = JSON.parse(req.body.jobData);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job data format: ' + parseError.message
        });
      }
    } else {
      jobData = req.body;
    }

    // Fix data types and parse nested JSON strings
    try {
      if (typeof jobData.recruitmentProcess === 'string') {
        jobData.recruitmentProcess = JSON.parse(jobData.recruitmentProcess);
      }
      if (jobData.ctc && jobData.ctc.total) {
        jobData.ctc.total = Number(jobData.ctc.total);
        if (jobData.ctc.breakdown) {
          jobData.ctc.breakdown.baseSalary = Number(jobData.ctc.breakdown.baseSalary) || 0;
          jobData.ctc.breakdown.bonus = Number(jobData.ctc.breakdown.bonus) || 0;
          jobData.ctc.breakdown.benefits = Number(jobData.ctc.breakdown.benefits) || 0;
          jobData.ctc.breakdown.other = Number(jobData.ctc.breakdown.other) || 0;
        }
      }
      if (typeof jobData.requirements === 'string') {
        jobData.requirements = JSON.parse(jobData.requirements);
      }
      if (jobData.eligibilityCriteria) {
        if (typeof jobData.eligibilityCriteria.departments === 'string') {
          jobData.eligibilityCriteria.departments = JSON.parse(jobData.eligibilityCriteria.departments);
        }
        if (typeof jobData.eligibilityCriteria.year === 'string') {
          jobData.eligibilityCriteria.year = JSON.parse(jobData.eligibilityCriteria.year);
        }
        if (typeof jobData.eligibilityCriteria.skills === 'string') {
          jobData.eligibilityCriteria.skills = JSON.parse(jobData.eligibilityCriteria.skills);
        }
      }
    } catch (nestedParseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid nested data format: ' + nestedParseError.message
      });
    }

    // Validation
    const errors = [];
    if (!jobData.ctc || !jobData.ctc.total || jobData.ctc.total <= 0) {
      errors.push('CTC total is required and must be greater than 0');
    }
    if (!jobData.recruitmentProcess || !Array.isArray(jobData.recruitmentProcess) || jobData.recruitmentProcess.length === 0) {
      errors.push('At least one recruitment process stage is required');
    }
    if (!jobData.title || !jobData.role || !jobData.description) {
      errors.push('Title, role, and description are required');
    }
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found. Please create company profile first.'
      });
    }

    // Process uploaded files to Cloudinary
    let documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, file.originalname, "job-documents");
        documents.push({
          filename: file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          type: getFileTypeCategory(file.originalname),
          uploadDate: new Date()
        });
      }
    }

    // Create job offer with processed data
    const jobOffer = await JobOffer.create({
      companyId: company._id,
      title: jobData.title,
      role: jobData.role,
      description: jobData.description,
      requirements: jobData.requirements,
      ctc: jobData.ctc,
      location: jobData.location,
      jobType: jobData.jobType,
      eligibilityCriteria: jobData.eligibilityCriteria,
      recruitmentProcess: jobData.recruitmentProcess,
      documents,
      totalRounds: jobData.recruitmentProcess ? jobData.recruitmentProcess.length : 0,
      currentRecruitmentStage: 1,
      currentApplicationCount: 0,
      jobStatus: 'open',
      applicationDeadline: jobData.applicationDeadline,
      maxApplications: jobData.maxApplications,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: documents.length > 0
        ? `Job created successfully with ${documents.length} document(s)`
        : 'Job created successfully',
      data: jobOffer
    });

  } catch (error) {
    console.error('Job creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update Job Offer (Company only) - Cloudinary for documents
const updateJobOffer = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Find existing job offer
    const existingJob = await JobOffer.findOne({
      _id: req.params.id,
      companyId: company._id
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job offer not found or unauthorized'
      });
    }

    // Parse jobData if it exists (from FormData)
    let jobData;
    if (req.body.jobData) {
      try {
        jobData = JSON.parse(req.body.jobData);
        if (typeof jobData.recruitmentProcess === 'string') {
          jobData.recruitmentProcess = JSON.parse(jobData.recruitmentProcess);
        }
        if (jobData.ctc && jobData.ctc.total) {
          jobData.ctc.total = Number(jobData.ctc.total);
        }
        if (typeof jobData.requirements === 'string') {
          jobData.requirements = JSON.parse(jobData.requirements);
        }
        if (jobData.eligibilityCriteria) {
          if (typeof jobData.eligibilityCriteria.departments === 'string') {
            jobData.eligibilityCriteria.departments = JSON.parse(jobData.eligibilityCriteria.departments);
          }
          if (typeof jobData.eligibilityCriteria.year === 'string') {
            jobData.eligibilityCriteria.year = JSON.parse(jobData.eligibilityCriteria.year);
          }
          if (typeof jobData.eligibilityCriteria.skills === 'string') {
            jobData.eligibilityCriteria.skills = JSON.parse(jobData.eligibilityCriteria.skills);
          }
        }
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job data format: ' + parseError.message
        });
      }
    } else {
      jobData = req.body;
    }

    // Process new uploaded files to Cloudinary
    let newDocuments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, file.originalname, "job-documents");
        newDocuments.push({
          filename: file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          type: getFileTypeCategory(file.originalname),
          uploadDate: new Date()
        });
      }
    }

    // Combine existing documents with new ones
    const updatedDocuments = [...existingJob.documents, ...newDocuments];

    const jobOffer = await JobOffer.findOneAndUpdate(
      { _id: req.params.id, companyId: company._id },
      {
        ...jobData,
        documents: updatedDocuments,
        totalRounds: jobData.recruitmentProcess ? jobData.recruitmentProcess.length : existingJob.totalRounds
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: newDocuments.length > 0
        ? `Job updated successfully with ${newDocuments.length} new document(s)`
        : 'Job updated successfully',
      data: jobOffer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Job Offers (Public - for students)
const getAllJobOffers = async (req, res) => {
  try {
    const jobOffers = await JobOffer.find({})
      .populate('companyId', 'companyName industry')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobOffers.length,
      jobs: jobOffers
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get Single Job Offer
const getJobOffer = async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id)
      .populate('companyId', 'companyName industry website description');

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Job offer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: jobOffer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get Company's Job Offers (Company only)
const getCompanyJobOffers = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    const jobOffers = await JobOffer.find({ companyId: company._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobOffers.length,
      data: jobOffers
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Job Offer (Company only)
const deleteJobOffer = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    const jobOffer = await JobOffer.findOneAndDelete({
      _id: req.params.id,
      companyId: company._id
    });

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: 'Job offer not found or unauthorized'
      });
    }

    // Delete associated documents from Cloudinary
    if (jobOffer.documents && jobOffer.documents.length > 0) {
      for (const doc of jobOffer.documents) {
        if (doc.public_id) {
          try {
            await cloudinary.uploader.destroy(doc.public_id, { resource_type: "raw" });
          } catch (err) {
            console.warn('Failed to delete document from Cloudinary:', err.message);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Job offer deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createJobOffer,
  getAllJobOffers,
  getJobOffer,
  getCompanyJobOffers,
  updateJobOffer,
  deleteJobOffer
};
