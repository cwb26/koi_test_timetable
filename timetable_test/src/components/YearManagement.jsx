import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';

const YearManagement = () => {
  const { academicYears, addAcademicYear, deleteAcademicYear } = useTimetable();
  const { hasPermission } = useAuth();
  const [newYear, setNewYear] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddYear = async (e) => {
    e.preventDefault();
    
    const year = parseInt(newYear);
    if (isNaN(year) || year < 2000 || year > 2100) {
      return;
    }

    setIsAdding(true);
    const success = await addAcademicYear(year);
    if (success) {
      setNewYear('');
    }
    setIsAdding(false);
  };

  const handleDeleteYear = async (year) => {
    if (window.confirm(`Are you sure you want to delete year ${year}? This will fail if there are courses in this year.`)) {
      await deleteAcademicYear(year);
    }
  };

  if (!hasPermission('admin')) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Calendar className="h-5 w-5 text-primary-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Academic Years</h2>
      </div>

      {/* Add New Year Form */}
      <form onSubmit={handleAddYear} className="mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="Enter year (e.g., 2027)"
            min="2000"
            max="2100"
            className="input flex-1"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newYear}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Year
          </button>
        </div>
      </form>

      {/* Years List */}
      <div className="space-y-2">
        {academicYears.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No academic years configured</p>
            <p className="text-sm">Add your first year above</p>
          </div>
        ) : (
          academicYears.map((yearObj) => (
            <div
              key={yearObj.year}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900">{yearObj.year}</span>
              </div>
              <button
                onClick={() => handleDeleteYear(yearObj.year)}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                title="Delete year"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You can only delete years that have no courses scheduled.
        </p>
      </div>
    </div>
  );
};

export default YearManagement;
