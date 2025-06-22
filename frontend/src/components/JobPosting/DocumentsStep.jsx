import { useState } from 'react';

const DocumentsStep = ({ formData, updateFormData }) => {
  const [dragActive, setDragActive] = useState(false);

  const fileTypes = [
    { value: 'jd', label: 'Job Description' },
    { value: 'ctc', label: 'CTC Details' },
    { value: 'company-info', label: 'Company Information' },
    { value: 'other', label: 'Other' }
  ];

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: 'other',
      id: Date.now() + Math.random()
    }));

    updateFormData({
      uploadedFiles: [...formData.uploadedFiles, ...newFiles]
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = formData.uploadedFiles.filter(file => file.id !== fileId);
    updateFormData({ uploadedFiles: updatedFiles });
  };

  const updateFileType = (fileId, newType) => {
    const updatedFiles = formData.uploadedFiles.map(file =>
      file.id === fileId ? { ...file, type: newType } : file
    );
    updateFormData({ uploadedFiles: updatedFiles });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📎';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-nit-navy mb-4">Supporting Documents</h3>
        <p className="text-gray-600 mb-6">Upload any additional documents related to this job posting (optional)</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-nit-red bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum file size: 10MB per file
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-nit-red text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Choose Files
          </label>
        </div>
      </div>

      {/* Uploaded Files List */}
      {formData.uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">
            Uploaded Files ({formData.uploadedFiles.length})
          </h4>
          <div className="space-y-3">
            {formData.uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* File Type Selector */}
                  <select
                    value={file.type}
                    onChange={(e) => updateFileType(file.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-nit-red focus:border-transparent"
                  >
                    {fileTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove file"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h5 className="font-medium text-yellow-900 mb-2">📋 Document Guidelines:</h5>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• <strong>Job Description:</strong> Detailed JD document</li>
          <li>• <strong>CTC Details:</strong> Salary breakdown, benefits info</li>
          <li>• <strong>Company Information:</strong> Company brochure, culture deck</li>
          <li>• <strong>Other:</strong> Any additional relevant documents</li>
        </ul>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">💡 Tips:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Documents are optional but help provide more context</li>
          <li>• Students can download these documents when viewing the job</li>
          <li>• Keep file sizes reasonable for faster downloads</li>
          <li>• Use clear, descriptive file names</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentsStep;
