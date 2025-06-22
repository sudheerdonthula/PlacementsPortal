import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import api from "../utils/api";

// Import step components
import BasicInfoStep from "../components/JobPosting/BasicInfoStep";
import RequirementsStep from "../components/JobPosting/RequirementsStep";
import CompensationStep from "../components/JobPosting/CompensationStep";
import ProcessStep from "../components/JobPosting/ProcessStep";
import DocumentsStep from "../components/JobPosting/DocumentsStep";
import ReviewStep from "../components/JobPosting/ReviewStep";

const JobPosting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    role: "",
    description: "",
    location: "",
    jobType: "full-time",
    applicationDeadline: "",

    // Requirements
    requirements: [""],
    eligibilityCriteria: {
      minCGPA: "",
      departments: [],
      year: [],
      skills: [""],
    },

    // Compensation
    ctc: {
      total: "",
      breakdown: {
        baseSalary: "",
        bonus: "",
        benefits: "",
        other: "",
      },
    },

    // Process
    recruitmentProcess: [
      { stageName: "", stageOrder: 1, date: "", description: "" },
    ],

    // Documents
    documents: [],
    uploadedFiles: [],
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: "Basic Info", component: BasicInfoStep },
    { number: 2, title: "Requirements", component: RequirementsStep },
    { number: 3, title: "Compensation", component: CompensationStep },
    { number: 4, title: "Process", component: ProcessStep },
    { number: 5, title: "Documents", component: DocumentsStep },
    { number: 6, title: "Review", component: ReviewStep },
  ];

  // Department options
  const departmentOptions = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Mathematics & Computing",
    "Physics",
    "Chemistry",
    "All Departments",
  ];

  // Year options
  const yearOptions = [
    { value: 1, label: "1st Year" },
    { value: 2, label: "2nd Year" },
    { value: 3, label: "3rd Year" },
    { value: 4, label: "4th Year" },
    { value: 5, label: "5th Year (Integrated)" },
  ];

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const response = await api.get("/company/profile");
      if (response.data.success) {
        setCompanyData(response.data.data);
      }
    } catch (error) {
      toast.error("Please complete your company profile first");
      navigate("/company-profile");
    }
  };

  const updateFormData = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.role.trim()) newErrors.role = "Role is required";
        if (!formData.description.trim())
          newErrors.description = "Description is required";
        if (!formData.location.trim())
          newErrors.location = "Location is required";
        if (!formData.applicationDeadline)
          newErrors.applicationDeadline = "Application deadline is required";

        // Check if deadline is in future
        if (
          formData.applicationDeadline &&
          new Date(formData.applicationDeadline) <= new Date()
        ) {
          newErrors.applicationDeadline = "Deadline must be in the future";
        }
        break;

      case 2: // Requirements
        if (formData.requirements.filter((req) => req.trim()).length === 0) {
          newErrors.requirements = "At least one requirement is needed";
        }
        if (formData.eligibilityCriteria.departments.length === 0) {
          newErrors.departments = "Select at least one department";
        }
        if (formData.eligibilityCriteria.year.length === 0) {
          newErrors.year = "Select at least one year";
        }
        break;

      case 3: // Compensation
        if (!formData.ctc.total || formData.ctc.total <= 0) {
          newErrors.ctcTotal = "Total CTC is required and must be positive";
        }
        break;

      case 4: // Process
        if (formData.recruitmentProcess.length === 0) {
          newErrors.recruitmentProcess =
            "At least one recruitment stage is required";
        }
        formData.recruitmentProcess.forEach((stage, index) => {
          if (!stage.stageName.trim()) {
            newErrors[`stage_${index}_name`] = "Stage name is required";
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();

      // Prepare job data object (excluding files)
      const jobDataToSend = {
        title: formData.title,
        role: formData.role,
        description: formData.description,
        requirements: formData.requirements, // Keep as array
        ctc: {
          ...formData.ctc,
          total: Number(formData.ctc.total), // Ensure it's a number
          breakdown: formData.ctc.breakdown
            ? {
                baseSalary: Number(formData.ctc.breakdown.baseSalary) || 0,
                bonus: Number(formData.ctc.breakdown.bonus) || 0,
                benefits: Number(formData.ctc.breakdown.benefits) || 0,
                other: Number(formData.ctc.breakdown.other) || 0,
              }
            : undefined,
        },
        location: formData.location,
        jobType: formData.jobType,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          departments: formData.eligibilityCriteria.departments, // Keep as array
          year: formData.eligibilityCriteria.year, // Keep as array
          skills: formData.eligibilityCriteria.skills, // Keep as array
          minCGPA: Number(formData.eligibilityCriteria.minCGPA) || 0,
        },
        recruitmentProcess: formData.recruitmentProcess, // Keep as array
        applicationDeadline: formData.applicationDeadline,
        maxApplications: Number(formData.maxApplications) || 0,
      };

      // Add jobData as a single JSON string
      submitData.append("jobData", JSON.stringify(jobDataToSend));

      // Add files with proper field names
      if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
        formData.uploadedFiles.forEach((fileObj, index) => {
          submitData.append("documents", fileObj.file); 
          submitData.append(`fileTypes[${index}]`, fileObj.type);
        });
      }

      // Debug logging
      console.log("=== FRONTEND SUBMIT DEBUG ===");
      console.log("Job data being sent:", jobDataToSend);
      console.log(
        "Files count:",
        formData.uploadedFiles ? formData.uploadedFiles.length : 0
      );
      console.log("CTC total type:", typeof jobDataToSend.ctc.total);
      console.log(
        "Recruitment process type:",
        typeof jobDataToSend.recruitmentProcess
      );

      const response = await api.post("/jobs", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Job posted successfully!");
        navigate("/company-dashboard");
      }
    } catch (error) {
      console.error("Job posting error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Error posting job");
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-nit-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-nit-navy">Post New Job</h1>
              <p className="text-nit-dark-purple">
                Create a new job opportunity
              </p>
            </div>
            <button
              onClick={() => navigate("/company-dashboard")}
              className="text-nit-navy hover:text-nit-red transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.number
                      ? "bg-nit-red text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-nit-navy"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-nit-red" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              departmentOptions={departmentOptions}
              yearOptions={yearOptions}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </span>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-nit-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  "Post Job"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPosting;
