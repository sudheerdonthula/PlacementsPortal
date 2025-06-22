const Company = require('../models/Company');
const User = require('../models/User');

// Create/Update Company Profile
const createCompanyProfile = async (req, res) => {
  try {
    const {
      companyName,
      industry,
      website,
      description,
      hrContact,
      address
    } = req.body;

    // Check if profile already exists
    let company = await Company.findOne({ userId: req.user._id });

    if (company) {
      // Update existing profile
      company = await Company.findOneAndUpdate(
        { userId: req.user._id },
        {
          companyName,
          industry,
          website,
          description,
          hrContact,
          address
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      company = await Company.create({
        userId: req.user._id,
        companyName,
        industry,
        website,
        description,
        hrContact,
        address
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get Company Profile
const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id }).populate('userId', 'name email');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Companies (Admin only)
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('userId', 'name email');
    
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Verify Company (Admin only)
const verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const company = await Company.findByIdAndUpdate(
      companyId,
      { isVerified: true },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company verified successfully',
      data: company
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCompanyProfile,
  getCompanyProfile,
  getAllCompanies,
  verifyCompany
};