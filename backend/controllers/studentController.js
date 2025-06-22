const Student = require('../models/Student');
const User = require('../models/User');
const path = require('path');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (student or company)
const getStudentProfile = async (req, res) => {
  try {
    let queryUserId;

    // If company, require studentId in query
    if (req.user.role === 'company') {
      if (!req.query.studentId) {
        return res.status(400).json({
          success: false,
          message: 'studentId query parameter is required for company users'
        });
      }
      queryUserId = req.query.studentId;
      console.log('Company fetching profile for student:', queryUserId);
    } else {
      // For students, use their own user id
      queryUserId = req.user.id;
      console.log('Student fetching own profile:', queryUserId);
    }

    const student = await Student.findOne({ userId: queryUserId }).populate('userId', 'name email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create or update student profile
// @route   POST /api/student/profile
// @access  Private
const createStudentProfile = async (req, res) => {
  try {
    const {
      studentId,
      phone,
      department,
      year,
      cgpa,
      skills,
      address
    } = req.body;

    console.log('Creating/updating profile for user:', req.user.id);
    console.log('Profile data:', req.body);

    // Validation
    if (!studentId || !phone || !department || !year || !cgpa) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentId, phone, department, year, cgpa'
      });
    }

    // Check if profile already exists
    let student = await Student.findOne({ userId: req.user.id });
    let isNewProfile = false;

    if (student) {
      // Update existing profile
      student.studentId = studentId;
      student.phone = phone;
      student.department = department;
      student.year = year;
      student.cgpa = cgpa;
      student.skills = skills || [];
      student.address = address || {};

      await student.save();
    } else {
      // Create new profile
      student = await Student.create({
        userId: req.user.id,
        studentId,
        phone,
        department,
        year,
        cgpa,
        skills: skills || [],
        address: address || {}
      });
      isNewProfile = true;
    }

    // Populate user data before sending response
    await student.populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: student,
      message: isNewProfile ? 'Profile created successfully' : 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error creating/updating student profile:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload resume (Cloudinary version)
// @route   POST /api/student/resume
// @access  Private
const uploadResume = async (req, res) => {
  try {
    console.log('Uploading resume for user:', req.user.id);
    console.log('File details:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please create your profile first.'
      });
    }

    // Delete old resume from Cloudinary if exists
    if (student.resume && student.resume.public_id) {
      try {
        await cloudinary.uploader.destroy(student.resume.public_id, { resource_type: "raw" });
        console.log('Deleted old resume from Cloudinary:', student.resume.public_id);
      } catch (err) {
        console.warn('Failed to delete old resume from Cloudinary:', err.message);
      }
    }

    // Upload new resume to Cloudinary with original filename and extension
    const streamUpload = (fileBuffer, originalname) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "resumes",
            public_id: originalname, // use original filename with extension
            use_filename: true,
            unique_filename: false, // keep the extension in the URL
            overwrite: true
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer, req.file.originalname);

    // Update student with resume info
    student.resume = {
      filename: req.file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      uploadDate: new Date()
    };

    await student.save();

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        filename: req.file.originalname,
        size: req.file.size
      },
      message: 'Resume uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading resume:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading resume'
    });
  }
};

// @desc    Get all students
// @route   GET /api/student/all
// @access  Private (Admin/Company)
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error getting all students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getStudentProfile,
  createStudentProfile,
  getAllStudents,
  uploadResume
};
