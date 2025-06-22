const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  cgpa: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }],
  resume: {
    filename: String,
    url: String,        // Cloudinary URL
    public_id: String,  // Cloudinary public ID (for deletion)
    uploadDate: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  isEligible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);