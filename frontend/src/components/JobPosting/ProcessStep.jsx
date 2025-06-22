import { useState } from "react";

const ProcessStep = ({ formData, updateFormData, errors }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const addStage = () => {
    const newStage = {
      stageName: "",
      stageOrder: formData.recruitmentProcess.length + 1,
      date: "",
      description: "",
    };

    updateFormData({
      recruitmentProcess: [...formData.recruitmentProcess, newStage],
    });
  };

  const removeStage = (index) => {
    const updatedProcess = formData.recruitmentProcess
      .filter((_, i) => i !== index)
      .map((stage, i) => ({ ...stage, stageOrder: i + 1 }));

    updateFormData({ recruitmentProcess: updatedProcess });
  };

  const updateStage = (index, field, value) => {
    const updatedProcess = formData.recruitmentProcess.map((stage, i) =>
      i === index ? { ...stage, [field]: value } : stage
    );

    updateFormData({ recruitmentProcess: updatedProcess });
  };

  const moveStage = (fromIndex, toIndex) => {
    const updatedProcess = [...formData.recruitmentProcess];
    const [movedStage] = updatedProcess.splice(fromIndex, 1);
    updatedProcess.splice(toIndex, 0, movedStage);

    // Update stage orders
    const reorderedProcess = updatedProcess.map((stage, i) => ({
      ...stage,
      stageOrder: i + 1,
    }));

    updateFormData({ recruitmentProcess: reorderedProcess });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveStage(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const commonStages = [
    "Online Application",
    "Resume Screening",
    "Online Assessment",
    "Technical Interview",
    "HR Interview",
    "Final Interview",
    "Offer Letter",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-nit-navy mb-4">
          Recruitment Process
        </h3>
        <p className="text-gray-600 mb-6">
          Define the stages of your recruitment process
        </p>
      </div>

      {/* Quick Add Common Stages */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          Quick Add Common Stages
        </h4>
        <div className="flex flex-wrap gap-2">
          {commonStages.map((stageName) => (
            <button
              key={stageName}
              type="button"
              onClick={() => {
                const newStage = {
                  stageName,
                  stageOrder: formData.recruitmentProcess.length + 1,
                  date: "",
                  description: "",
                };
                updateFormData({
                  recruitmentProcess: [
                    ...formData.recruitmentProcess,
                    newStage,
                  ],
                });
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              + {stageName}
            </button>
          ))}
        </div>
      </div>

      {/* Recruitment Stages */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-gray-800">
            Recruitment Stages *
          </h4>
          <button
            type="button"
            onClick={addStage}
            className="px-4 py-2 bg-nit-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            + Add Stage
          </button>
        </div>

        {formData.recruitmentProcess.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No recruitment stages added yet</p>
            <button
              type="button"
              onClick={addStage}
              className="mt-2 text-nit-red hover:text-red-700 font-medium"
            >
              Add your first stage
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.recruitmentProcess.map((stage, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`border rounded-lg p-4 bg-white ${
                  draggedIndex === index ? "opacity-50" : ""
                } hover:shadow-md transition-shadow cursor-move`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-nit-red text-white text-sm rounded-full font-medium">
                      {stage.stageOrder}
                    </span>
                    <span className="text-sm text-gray-500">
                      Drag to reorder
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stage Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage Name *
                    </label>
                    <input
                      type="text"
                      value={stage.stageName}
                      onChange={(e) =>
                        updateStage(index, "stageName", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent ${
                        errors[`stage_${index}_name`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., Technical Interview"
                    />
                    {errors[`stage_${index}_name`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`stage_${index}_name`]}
                      </p>
                    )}
                  </div>

                  {/* Stage Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tentative Date
                    </label>
                    <input
                      type="date"
                      value={stage.date}
                      onChange={(e) =>
                        updateStage(index, "date", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Stage Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={stage.description}
                    onChange={(e) =>
                      updateStage(index, "description", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nit-red focus:border-transparent"
                    placeholder="Brief description of this stage..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.recruitmentProcess && (
          <p className="text-red-500 text-sm mt-2">
            {errors.recruitmentProcess}
          </p>
        )}
      </div>

      {/* Warning for extra round */}
      {formData.recruitmentProcess.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4 flex items-start space-x-2">
          <span className="text-yellow-600 text-xl mt-1">⚠️</span>
          <div>
            <span className="font-semibold text-yellow-900">Important:</span>{" "}
            Please remember to{" "}
            <strong>
              add an extra round at the end for the selected candidates
            </strong>{" "}
            (e.g., "Final Selection" or "Offer Rollout") to ensure the process is
            complete.
          </div>
        </div>
      )}

      {/* Process Summary */}
      {formData.recruitmentProcess.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">📋 Process Summary</h5>
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              <strong>Total Rounds:</strong>{" "}
              {formData.recruitmentProcess.length}
            </p>
            <div className="space-y-1">
              {formData.recruitmentProcess.map((stage, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {stage.stageOrder}
                  </span>
                  <span>{stage.stageName}</span>
                  {stage.date && (
                    <span className="text-blue-600">
                      • {new Date(stage.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="font-medium text-green-900 mb-2">💡 Best Practices:</h5>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Keep the process simple and transparent</li>
          <li>• Provide tentative dates to help candidates plan</li>
          <li>• Include brief descriptions for each stage</li>
          <li>• Consider the time commitment for candidates</li>
          <li>• Drag and drop to reorder stages</li>
        </ul>
      </div>
    </div>
  );
};

export default ProcessStep;
