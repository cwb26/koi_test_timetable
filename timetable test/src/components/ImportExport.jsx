import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ImportExport = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileUpload = async (file, type) => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/import/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResults(result);
        toast.success(`Import completed! ${result.processed} records processed`);
      } else {
        setUploadResults(result);
        toast.error(result.error || result.message || `Import failed (${response.status})`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import file');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async (type) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/import/${type}/template`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_template.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Template downloaded successfully');
      } else {
        let msg = 'Failed to download template';
        try {
          const data = await response.json();
          if (data?.error) msg = data.error;
        } catch {}
        toast.error(`${msg} (${response.status})`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const FileUploadSection = ({ type, title, description }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="space-y-4">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Download Template</h4>
            <p className="text-sm text-gray-600">Get the CSV template with the correct format</p>
          </div>
          <button
            onClick={() => downloadTemplate(type)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Template
          </button>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Upload CSV File</p>
            <p className="text-gray-600">Drag and drop or click to select</p>
          </div>
          
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e.target.files[0], type)}
            className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isUploading}
          />
        </div>

        {/* Upload Results */}
        {uploadResults && (
          <div className="mt-6 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              {uploadResults.errors && uploadResults.errors.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <h4 className="font-medium">
                {uploadResults.message || 'Import Results'}
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uploadResults.total || 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{uploadResults.processed || 0}</div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{uploadResults.created || 0}</div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{uploadResults.updated || 0}</div>
                <div className="text-sm text-gray-600">Updated</div>
              </div>
            </div>

            {uploadResults.errors && uploadResults.errors.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-red-600">Errors:</h5>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Line {error.line}: {error.error}
                      {error.details && <div className="text-xs mt-1">Details: {error.details}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import/Export</h1>
          <p className="text-gray-600">Bulk import lecturers and courses via CSV files</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'teachers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Teachers/Lecturers
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Courses
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Processing upload...</span>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <FileUploadSection
            type="teachers"
            title="Import Teachers/Lecturers"
            description="Upload a CSV file to bulk import or update teacher information. Existing teachers will be updated based on their name."
          />
        )}

        {activeTab === 'courses' && (
          <FileUploadSection
            type="courses"
            title="Import Courses"
            description="Upload a CSV file to bulk import or update course information. Existing courses will be updated based on name, year, and trimester. Make sure teachers and rooms exist before importing courses."
          />
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Instructions</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">Teachers CSV Format:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>name</strong> (required): Full name of the teacher</li>
                <li><strong>department</strong> (optional): Department or faculty</li>
                <li><strong>email</strong> (optional): Email address</li>
                <li><strong>phone</strong> (optional): Phone number</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Courses CSV Format:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>name</strong> (required): Course name</li>
                <li><strong>teacher_name</strong> (required): Exact teacher name (must exist)</li>
                <li><strong>room_name</strong> (required): Exact room name (must exist)</li>
                <li><strong>day</strong> (required): Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday</li>
                <li><strong>start_time</strong> (required): Format HH:MM (e.g., 09:00)</li>
                <li><strong>end_time</strong> (required): Format HH:MM (e.g., 10:30)</li>
                <li><strong>year</strong> (required): Year (2000-2100)</li>
                <li><strong>trimester</strong> (required): Trimester (1-4)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800">
                <strong>Note:</strong> The system will automatically detect and prevent scheduling conflicts. 
                Existing records will be updated based on unique identifiers (name for teachers, name+year+trimester for courses).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
