const Application = require("../models/Application");
const Student = require("../models/Student");
const JobOffer = require("../models/JobOffer");
const Company = require("../models/Company");

// Apply for Job (Student only)
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    // Get student profile
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found. Please create profile first.",
      });
    }

    // Get job offer
    const jobOffer = await JobOffer.findById(jobId);
    if (!jobOffer || jobOffer.jobStatus === "cancelled") {
      return res.status(404).json({
        success: false,
        message: "Job offer not found or cancelled",
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      studentId: student._id,
      jobOfferId: jobId,
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Check application deadline
    if (new Date() > jobOffer.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    // Create application
    const application = await Application.create({
      studentId: student._id,
      jobOfferId: jobId,
      currentRound: 1,
      totalRounds: jobOffer.totalRounds,
      applicationStatus: "in-progress",
    });

    // Update job offer application count
    await JobOffer.findByIdAndUpdate(jobId, {
      $inc: { currentApplicationCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id; // From auth middleware

    // Check if application exists
    const application = await Application.findOne({
      studentId: studentId,
      jobOfferId: jobId,
    });

    res.json({
      success: true,
      isApplied: !!application, // Convert to boolean
      applicationId: application?._id || null,
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking application status",
    });
  }
};

// Get Student's Applications (Student only)
const getStudentApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: "jobOfferId",
        populate: {
          path: "companyId",
          select: "companyName industry",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Applications for Company's Job Offers (Company only)
const getJobApplications = async (req, res) => {
  try {
    const { jobOfferId } = req.params;
    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Verify job offer belongs to company
    const jobOffer = await JobOffer.findOne({
      _id: jobOfferId,
      companyId: company._id,
    });
    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: "Job offer not found or unauthorized",
      });
    }

    const applications = await Application.find({ jobOfferId: jobOfferId })
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
      jobOffer: jobOffer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Applications for a specific round (Company only) - UPDATED
const getRoundApplications = async (req, res) => {
  try {
    const { jobOfferId, roundNumber } = req.params;
    const {
      status,
      department,
      sortBy = "createdAt",
      page = 1,
      limit = 50,
    } = req.query;

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Verify job offer belongs to company
    const jobOffer = await JobOffer.findOne({
      _id: jobOfferId,
      companyId: company._id,
    }).populate("companyId", "companyName");

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: "Job offer not found or unauthorized",
      });
    }

    const currentRound = jobOffer.currentRecruitmentStage || 1;
    const requestedRound = parseInt(roundNumber);

    let query = { jobOfferId: jobOfferId };

    // Logic for different round views
    if (requestedRound < currentRound) {
      // Completed round - show only rejected students from that round
      query.currentRound = requestedRound;
      query.applicationStatus = "rejected";
    } else if (requestedRound === currentRound) {
      // Check if this is the final round
      if (requestedRound === jobOffer.totalRounds) {
        // Final round - show only accepted students
        query.currentRound = requestedRound;
        query.applicationStatus = "accepted";
      } else {
        // Active (not final) round - show in-progress students
        query.currentRound = requestedRound;
        query.applicationStatus = "in-progress";
      }
    } else {
      // Future round - no students yet
      query._id = { $in: [] }; // Empty result
    }

    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case "name":
        sortObj = { createdAt: -1 };
        break;
      case "cgpa":
        sortObj = { createdAt: -1 };
        break;
      case "date":
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Get applications with populated student data
    const applications = await Application.find(query)
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by department if specified
    let filteredApplications = applications;
    if (department && department !== "all") {
      filteredApplications = applications.filter(
        (app) => app.studentId?.department === department
      );
    }

    // Sort by name or cgpa if specified
    if (sortBy === "name") {
      filteredApplications.sort((a, b) => {
        const nameA = a.studentId?.userId?.name || "";
        const nameB = b.studentId?.userId?.name || "";
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "cgpa") {
      filteredApplications.sort((a, b) => {
        const cgpaA = a.studentId?.cgpa || 0;
        const cgpaB = b.studentId?.cgpa || 0;
        return cgpaB - cgpaA;
      });
    }

    const total = await Application.countDocuments(query);

    // Get round statistics
    const stats = await Application.aggregate([
      {
        $match: {
          jobOfferId: jobOffer._id,
          currentRound: parseInt(roundNumber),
        },
      },
      {
        $group: {
          _id: "$applicationStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const roundStats = {
      total: total,
      "in-progress": stats.find((s) => s._id === "in-progress")?.count || 0,
      accepted: stats.find((s) => s._id === "accepted")?.count || 0,
      rejected: stats.find((s) => s._id === "rejected")?.count || 0,
    };

    res.status(200).json({
      success: true,
      data: filteredApplications,
      jobOffer: jobOffer,
      roundStats: roundStats,
      currentRound: currentRound,
      isActiveRound: requestedRound === currentRound,
      isCompletedRound: requestedRound < currentRound,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching round applications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching applications",
    });
  }
};

// Push selected students to next round (Company only) - NEW
const pushToNextRound = async (req, res) => {
  try {
    const { jobOfferId } = req.params;
    const { applicationIds, currentRound } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Application IDs are required",
      });
    }

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Verify job offer belongs to company
    const jobOffer = await JobOffer.findOne({
      _id: jobOfferId,
      companyId: company._id,
    });

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: "Job offer not found or unauthorized",
      });
    }

    const nextRound = currentRound + 1;

    // Check if next round is final round
    if (nextRound === jobOffer.totalRounds) {
      // Final round - mark as accepted immediately
      await Application.updateMany(
        {
          _id: { $in: applicationIds },
          jobOfferId: jobOfferId,
          currentRound: currentRound,
        },
        {
          currentRound: nextRound,
          applicationStatus: "accepted",
          updatedAt: new Date(),
        }
      );
    } else {
      // Intermediate round - keep as in-progress
      await Application.updateMany(
        {
          _id: { $in: applicationIds },
          jobOfferId: jobOfferId,
          currentRound: currentRound,
        },
        {
          currentRound: nextRound,
          applicationStatus: "in-progress",
          updatedAt: new Date(),
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Successfully pushed ${applicationIds.length} students to round ${nextRound}`,
      data: {
        pushedCount: applicationIds.length,
        nextRound: nextRound,
        isFinalRound: nextRound === jobOffer.totalRounds,
      },
    });
  } catch (error) {
    console.error("Error pushing to next round:", error);
    res.status(500).json({
      success: false,
      message: "Server error while pushing to next round",
    });
  }
};

// Reject selected students (Company only) - NEW
const rejectSelected = async (req, res) => {
  try {
    const { jobOfferId } = req.params;
    const { applicationIds } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Application IDs are required",
      });
    }

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Verify job offer belongs to company
    const jobOffer = await JobOffer.findOne({
      _id: jobOfferId,
      companyId: company._id,
    });

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: "Job offer not found or unauthorized",
      });
    }

    // Reject selected applications
    await Application.updateMany(
      {
        _id: { $in: applicationIds },
        jobOfferId: jobOfferId,
      },
      {
        applicationStatus: "rejected",
        updatedAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: `Successfully rejected ${applicationIds.length} students`,
      data: {
        rejectedCount: applicationIds.length,
      },
    });
  } catch (error) {
    console.error("Error rejecting students:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting students",
    });
  }
};

// Advance to next round (Company only) - UPDATED
const advanceToNextRound = async (req, res) => {
  try {
    const { jobOfferId } = req.params;
    const { currentRound } = req.body;

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Verify job offer belongs to company
    const jobOffer = await JobOffer.findOne({
      _id: jobOfferId,
      companyId: company._id,
    });

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: "Job offer not found or unauthorized",
      });
    }

       // Check if there are students in the next round
    const nextRound = currentRound + 1;
    const studentsInNextRound = await Application.countDocuments({
      jobOfferId: jobOfferId,
      currentRound: nextRound,
    });

    if (studentsInNextRound === 0) {
      return res.status(400).json({
        success: false,
        message: "Please push at least one student to the next round before advancing",
      });
    }

    // Check if there are more rounds
    if (currentRound >= jobOffer.totalRounds) {
      return res.status(400).json({
        success: false,
        message: "This is already the final round",
      });
    }

    // Auto-reject all remaining in-progress applications in current round
    await Application.updateMany(
      {
        jobOfferId: jobOfferId,
        currentRound: currentRound,
        applicationStatus: "in-progress",
      },
      {
        applicationStatus: "rejected",
        updatedAt: new Date(),
      }
    );

    // Update job offer current recruitment stage
    jobOffer.currentRecruitmentStage = nextRound;
    await jobOffer.save();

    res.status(200).json({
      success: true,
      message: `Successfully advanced to round ${nextRound}`,
      data: {
        newRound: nextRound,
        studentsInNextRound: studentsInNextRound,
      },
    });
  } catch (error) {
    console.error("Error advancing to next round:", error);
    res.status(500).json({
      success: false,
      message: "Server error while advancing to next round",
    });
  }
};

// Complete hiring process (Company only) - UPDATED
const completeHiring = async (req, res) => {
  try {
    const { jobOfferId } = req.params;

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Verify job offer belongs to company
    const jobOffer = await JobOffer.findOne({
      _id: jobOfferId,
      companyId: company._id,
    });

    if (!jobOffer) {
      return res.status(404).json({
        success: false,
        message: "Job offer not found or unauthorized",
      });
    }

    // Check if we're in the final round
    if (jobOffer.currentRecruitmentStage !== jobOffer.totalRounds) {
      return res.status(400).json({
        success: false,
        message: "Can only complete hiring in the final round",
      });
    }

    // Mark job offer as completed
    jobOffer.jobStatus = "completed";
    jobOffer.completedAt = new Date();
    await jobOffer.save();

    // Get final statistics
    const finalStats = await Application.aggregate([
      { $match: { jobOfferId: jobOffer._id } },
      {
        $group: {
          _id: "$applicationStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: await Application.countDocuments({ jobOfferId: jobOfferId }),
      accepted: finalStats.find((s) => s._id === "accepted")?.count || 0,
      rejected: finalStats.find((s) => s._id === "rejected")?.count || 0,
      "in-progress": finalStats.find((s) => s._id === "in-progress")?.count || 0,
    };

    res.status(200).json({
      success: true,
      message: "Hiring process completed successfully",
      data: {
        jobOffer: jobOffer,
        finalStats: stats,
      },
    });
  } catch (error) {
    console.error("Error completing hiring process:", error);
    res.status(500).json({
      success: false,
      message: "Server error while completing hiring process",
    });
  }
};

// Update Application Stage (Company only) - KEPT FOR BACKWARD COMPATIBILITY
const updateApplicationStage = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { applicationStatus, roundNumber } = req.body;

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Get application and verify it belongs to company's job
    const application = await Application.findById(applicationId).populate(
      "jobOfferId"
    );
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify job belongs to company
    if (
      application.jobOfferId.companyId.toString() !== company._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this application",
      });
    }

    // Update application status
    if (applicationStatus) {
      application.applicationStatus = applicationStatus;
    }

    // Update current round if provided
    if (roundNumber) {
      application.currentRound = parseInt(roundNumber);
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating application",
    });
  }
};

// Bulk update applications (Company only) - KEPT FOR BACKWARD COMPATIBILITY
const bulkUpdateApplications = async (req, res) => {
  try {
    const { applicationIds, applicationStatus } = req.body;

    if (
      !applicationIds ||
      !Array.isArray(applicationIds) ||
      applicationIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Application IDs are required",
      });
    }

    // Get company profile
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Get applications and verify ownership
    const applications = await Application.find({
      _id: { $in: applicationIds },
    }).populate("jobOfferId");

    for (let app of applications) {
      if (app.jobOfferId.companyId.toString() !== company._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update some applications",
        });
      }
    }

    // Update all applications
    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      {
        applicationStatus,
        updatedAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} applications updated successfully`,
      data: {
        updated: result.modifiedCount,
        total: applicationIds.length,
      },
    });
  } catch (error) {
    console.error("Error bulk updating applications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating applications",
    });
  }
};

// Get All Applications (Admin only)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "jobOfferId",
        populate: {
          path: "companyId",
          select: "companyName",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
  rejectSelected,
};

