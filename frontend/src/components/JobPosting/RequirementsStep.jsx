import { useState } from 'react';

const RequirementsStep = ({ formData, updateFormData, errors, departmentOptions, yearOptions }) => {
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const updatedRequirements = [
        ...formData.requirements.filter(r => r.trim() !== ''), // filter out empty strings
        newRequirement.trim()
      ];
      updateFormData({ requirements: updatedRequirements });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    const updatedRequirements = formData.requirements.filter((r, i) => i !== index && r.trim() !== '');
    updateFormData({ requirements: updatedRequirements });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [
        ...formData.eligibilityCriteria.skills.filter(s => s.trim() !== ''), // filter out empty strings
        newSkill.trim()
      ];
      updateFormData({
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          skills: updatedSkills
        }
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = formData.eligibilityCriteria.skills.filter((s, i) => i !== index && s.trim() !== '');
    updateFormData({
      eligibilityCriteria: {
        ...formData.eligibilityCriteria,
        skills: updatedSkills
      }
    });
  };

  const handleDepartmentChange = (department) => {
    const updatedDepartments = formData.eligibilityCriteria.departments.includes(department)
      ? formData.eligibilityCriteria.departments.filter(d => d !== department)
      : [...formData.eligibilityCriteria.departments, department];
    
    updateFormData({
      eligibilityCriteria: {
        ...formData.eligibilityCriteria,
        departments: updatedDepartments
      }
    });
  };

  const handleYearChange = (year) => {
    const updatedYears = formData.eligibilityCriteria.year.includes(year)
      ? formData.eligibilityCriteria.year.filter(y => y !== year)
      : [...formData.eligibilityCriteria.year, year];
    
    updateFormData({
      eligibilityCriteria: {
        ...formData.eligibilityCriteria,
        year: updatedYears
      }
    });
  };

  const handleCGPAChange = (e) => {
    updateFormData({
      eligibilityCriteria: {
        ...formData.eligibilityCriteria,
        minCGPA: parseFloat(e.target.value) || ''
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Warning Note */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-center space-x-3">
        <span className="text-yellow-800 text-xl">⚠️</span>
        <span className="text-yellow-800 text-sm sm:text-base">
          <b>Note:</b> Please add an <b>extra round at the end</b> of your recruitment process. This is required for the selected candidates to be displayed and finalized properly.
        </span>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-nit-navy mb-4">Job Requirements & Eligibility</h3>
        <p className="text-gray-600 mb-6">Define the requirements and eligibility criteria for this position</p>
      </div>

      {/* Job Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Job Requirements *
        </label>
        <div className="space-y-3">
          {formData.requirements.filter(r => r.trim() !== '').map((requirement, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{requirement}</p>
              </div>
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                ✕
              </button>
            </div>
          ))}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
              placeholder="Add a job requirement..."
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-nit-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
        {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>}
      </div>

      {/* Eligibility Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Departments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Eligible Departments *
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {departmentOptions.map((department) => (
              <label key={department} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.eligibilityCriteria.departments.includes(department)}
                  onChange={() => handleDepartmentChange(department)}
                  className="rounded border-gray-300 text-nit-red focus:ring-nit-red"
                />
                <span className="text-sm text-gray-700">{department}</span>
              </label>
            ))}
          </div>
          {errors.departments && <p className="text-red-500 text-sm mt-1">{errors.departments}</p>}
        </div>

        {/* Academic Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Eligible Academic Years *
          </label>
          <div className="space-y-2">
            {yearOptions.map((yearOption) => (
              <label key={yearOption.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.eligibilityCriteria.year.includes(yearOption.value)}
                  onChange={() => handleYearChange(yearOption.value)}
                  className="rounded border-gray-300 text-nit-red focus:ring-nit-red"
                />
                <span className="text-sm text-gray-700">{yearOption.label}</span>
              </label>
            ))}
          </div>
          {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
        </div>
      </div>

      {/* Minimum CGPA */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum CGPA
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="10"
          value={formData.eligibilityCriteria.minCGPA}
          onChange={handleCGPAChange}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
          placeholder="e.g., 7.5"
        />
        <p className="text-sm text-gray-500 mt-1">Leave empty if no minimum CGPA requirement</p>
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Required Skills
        </label>
        <div className="space-y-3">
          {formData.eligibilityCriteria.skills.filter(s => s.trim() !== '').length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.eligibilityCriteria.skills.filter(s => s.trim() !== '').map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-nit-red text-white text-sm rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
              placeholder="Add a required skill..."
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-nit-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsStep;
