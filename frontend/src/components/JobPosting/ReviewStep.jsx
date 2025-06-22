const ReviewStep = ({ formData }) => {
  const formatCurrency = (amount) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-nit-navy mb-4">
          Review Job Posting
        </h3>
        <p className="text-gray-600 mb-6">
          Please review all the details before posting the job
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 bg-nit-red text-white rounded-full flex items-center justify-center text-sm mr-2">
            1
          </span>
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Job Title
            </label>
            <p className="text-gray-900">{formData.title || "Not specified"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Role</label>
            <p className="text-gray-900">{formData.role || "Not specified"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Location
            </label>
            <p className="text-gray-900">
              {formData.location || "Not specified"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Job Type
            </label>
            <p className="text-gray-900 capitalize">
              {formData.jobType || "Not specified"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">
              Application Deadline
            </label>
            <p className="text-gray-900">
              {formatDateTime(formData.applicationDeadline)}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">
              Job Description
            </label>
            <p className="text-gray-900 whitespace-pre-wrap">
              {formData.description || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 bg-nit-red text-white rounded-full flex items-center justify-center text-sm mr-2">
            2
          </span>
          Requirements & Eligibility
        </h4>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Job Requirements
            </label>
            {formData.requirements && formData.requirements.length > 0 ? (
              <ul className="list-disc list-inside text-gray-900 space-y-1">
                {formData.requirements
                  .filter((req) => req.trim())
                  .map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500">No requirements specified</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Eligible Departments
              </label>
              {formData.eligibilityCriteria.departments.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.eligibilityCriteria.departments.map(
                    (dept, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {dept}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No departments specified</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Eligible Years
              </label>
              {formData.eligibilityCriteria.year.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.eligibilityCriteria.year.map((year, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                    >
                      Year {year}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No years specified</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Minimum CGPA
              </label>
              <p className="text-gray-900">
                {formData.eligibilityCriteria.minCGPA ||
                  "No minimum requirement"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Required Skills
              </label>
              {formData.eligibilityCriteria.skills &&
              formData.eligibilityCriteria.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.eligibilityCriteria.skills
                    .filter((skill) => skill.trim())
                    .map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific skills required</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 bg-nit-red text-white rounded-full flex items-center justify-center text-sm mr-2">
            3
          </span>
          Compensation
        </h4>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Total CTC (Annual)
            </label>
            <p className="text-xl font-semibold text-green-600">
              {formatCurrency(formData.ctc.total)}
            </p>
          </div>

          {(formData.ctc.breakdown.baseSalary ||
            formData.ctc.breakdown.bonus ||
            formData.ctc.breakdown.benefits ||
            formData.ctc.breakdown.other) && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                CTC Breakdown
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.ctc.breakdown.baseSalary && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Base Salary</p>
                    <p className="font-semibold text-sm">
                      {formatCurrency(formData.ctc.breakdown.baseSalary)}
                    </p>
                  </div>
                )}
                {formData.ctc.breakdown.bonus && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Bonus</p>
                    <p className="font-semibold text-sm">
                      {formatCurrency(formData.ctc.breakdown.bonus)}
                    </p>
                  </div>
                )}
                {formData.ctc.breakdown.benefits && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Benefits</p>
                    <p className="font-semibold text-sm">
                      {formatCurrency(formData.ctc.breakdown.benefits)}
                    </p>
                  </div>
                )}
                {formData.ctc.breakdown.other && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Other</p>
                    <p className="font-semibold text-sm">
                      {formatCurrency(formData.ctc.breakdown.other)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recruitment Process */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 bg-nit-red text-white rounded-full flex items-center justify-center text-sm mr-2">
            4
          </span>
          Recruitment Process
        </h4>

        {formData.recruitmentProcess &&
        formData.recruitmentProcess.length > 0 ? (
          <div className="space-y-3">
            {formData.recruitmentProcess.map((stage, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded"
              >
                <span className="flex items-center justify-center w-6 h-6 bg-nit-red text-white text-sm rounded-full font-medium flex-shrink-0">
                  {stage.stageOrder}
                </span>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">
                    {stage.stageName}
                  </h5>
                  {stage.date && (
                    <p className="text-sm text-gray-600">
                      📅 {formatDate(stage.date)}
                    </p>
                  )}
                  {stage.description && (
                    <p className="text-sm text-gray-700 mt-1">
                      {stage.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recruitment process defined</p>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-6 h-6 bg-nit-red text-white rounded-full flex items-center justify-center text-sm mr-2">
            5
          </span>
          Supporting Documents
        </h4>

        {formData.uploadedFiles && formData.uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {formData.uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
              >
                <span className="text-lg">📎</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {file.type.charAt(0).toUpperCase() + file.type.slice(1)} •{" "}
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No documents uploaded</p>
        )}
      </div>

      {/* Final Confirmation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-yellow-900 mb-3">
          ⚠️ Before You Submit
        </h4>
        <div className="space-y-2 text-sm text-yellow-800">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
              required
            />
            <span>
              I confirm that all the information provided is accurate and
              complete
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
              required
            />
            <span>
              I understand that this job posting will be visible to all eligible
              students
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
              required
            />
            <span>
              I agree to the terms and conditions of the placement portal
            </span>
          </label>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-blue-900 mb-3">
          📊 Posting Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formData.eligibilityCriteria.departments.length}
            </p>
            <p className="text-sm text-blue-800">Departments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formData.eligibilityCriteria.year.length}
            </p>
            <p className="text-sm text-blue-800">Year Groups</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formData.recruitmentProcess.length}
            </p>
            <p className="text-sm text-blue-800">Process Stages</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formData.uploadedFiles.length}
            </p>
            <p className="text-sm text-blue-800">Documents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
