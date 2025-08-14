import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimetable } from '../contexts/TimetableContext';
import { 
  Calendar, 
  Filter, 
  Download, 
  Printer,
  AlertTriangle,
  Plus
} from 'lucide-react';
import AddCourseModal from './AddCourseModal';
import CourseCard from './CourseCard';

const TimetableView = () => {
  const { hasPermission } = useAuth();
  const { 
    selectedYear, 
    setSelectedYear, 
    selectedTrimester, 
    setSelectedTrimester,
    getFilteredCourses,
    conflicts
  } = useTimetable();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    teacherId: '',
    roomId: '',
    day: ''
  });

  const years = ['2025', '2026', '2027'];
  const trimesters = ['1', '2', '3', 'Intensive'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const filteredCourses = getFilteredCourses(filters);
  const hasConflicts = conflicts.length > 0;

  const getCourseAtTimeSlot = (day, time) => {
    return filteredCourses.find(course => 
      course.day === day && course.startTime === time
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable View</h1>
          <p className="text-gray-600">
            Manage and view your course schedule
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {hasPermission('create') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </button>
          )}
          
          <button
            onClick={handlePrint}
            className="btn btn-outline print-hidden"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          
          <button className="btn btn-outline print-hidden">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Year/Trimester Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input w-32"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trimester
            </label>
            <select
              value={selectedTrimester}
              onChange={(e) => setSelectedTrimester(e.target.value)}
              className="input w-32"
            >
              {trimesters.map(trimester => (
                <option key={trimester} value={trimester}>{trimester}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conflict Alerts */}
      {hasConflicts && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Schedule Conflicts Detected
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {conflicts.map((conflict, index) => (
                  <p key={index} className="mb-1">• {conflict.message}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher
            </label>
            <select
              value={filters.teacherId}
              onChange={(e) => setFilters(prev => ({ ...prev, teacherId: e.target.value }))}
              className="input"
            >
              <option value="">All Teachers</option>
              {/* Teacher options would be populated here */}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              value={filters.roomId}
              onChange={(e) => setFilters(prev => ({ ...prev, roomId: e.target.value }))}
              className="input"
            >
              <option value="">All Rooms</option>
              {/* Room options would be populated here */}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>
            <select
              value={filters.day}
              onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
              className="input"
            >
              <option value="">All Days</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="timetable-header w-24">Time</th>
                {days.map(day => (
                  <th key={day} className="timetable-header">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="timetable-header font-medium">
                    {time}
                  </td>
                  {days.map(day => {
                    const course = getCourseAtTimeSlot(day, time);
                    return (
                      <td key={day} className="timetable-cell">
                        {course ? (
                          <CourseCard 
                            course={course} 
                            isConflict={conflicts.some(c => 
                              c.courses.some(conflictCourse => conflictCourse.id === course.id)
                            )}
                          />
                        ) : (
                          <div className="text-gray-400 text-xs text-center py-2">
                            Available
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <AddCourseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default TimetableView;

