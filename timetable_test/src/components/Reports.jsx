import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimetable } from '../contexts/TimetableContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileText, 
  Filter,
  Calendar,
  Users,
  Building2
} from 'lucide-react';

const Reports = () => {
  const { hasPermission } = useAuth();
  const { 
    courses, 
    teachers, 
    rooms,
    academicYears,
    selectedYear,
    setSelectedYear,
    selectedTrimester,
    setSelectedTrimester,
    getFilteredCourses,
    conflicts 
  } = useTimetable();

  const [filters, setFilters] = useState({
    teacherId: '',
    roomId: '',
    day: ''
  });

  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeConflicts, setIncludeConflicts] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const trimesters = ['1', '2', '3', 'Intensive'];
  const currentCourses = getFilteredCourses(filters);

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      // PDF export logic would go here
      alert('PDF export functionality would be implemented here');
    } else {
      // CSV export logic would go here
      alert('CSV export functionality would be implemented here');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setFilters({
      teacherId: '',
      roomId: '',
      day: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-gray-600">
          Generate reports and export your timetable data
        </p>
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
              {academicYears.map(yearObj => (
                <option key={yearObj.year} value={yearObj.year}>{yearObj.year}</option>
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
                <option key={trimester} value={trimester}>Trimester {trimester}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <Calendar className="h-4 w-4 inline mr-1" />
              Reporting on: {selectedYear} - Trimester {selectedTrimester}
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Export Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="input"
            >
              <option value="pdf">PDF Document</option>
              <option value="csv">CSV Spreadsheet</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Include Conflicts
            </label>
            <select
              value={includeConflicts ? 'yes' : 'no'}
              onChange={(e) => setIncludeConflicts(e.target.value === 'yes')}
              className="input"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="btn btn-primary w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handlePrint}
              className="btn btn-outline w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filter Data</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
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
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
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
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {currentCourses.length} of {courses.length} total courses
          </div>
          
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{currentCourses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${conflicts.length > 0 ? 'bg-red-500' : 'bg-gray-500'}`}>
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conflicts</p>
              <p className="text-2xl font-bold text-gray-900">{conflicts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print View (Hidden by default, shown when printing) */}
      <div className="hidden print:block">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Timetable Report</h1>
          <p className="text-lg text-gray-600">
            {selectedYear} - Trimester {selectedTrimester}
          </p>
          <p className="text-sm text-gray-500">
            Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Total Courses: {currentCourses.length}</div>
              <div>Total Teachers: {teachers.length}</div>
              <div>Total Rooms: {rooms.length}</div>
              <div>Conflicts: {conflicts.length}</div>
            </div>
          </div>
          
          {currentCourses.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Schedule</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Course</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Teacher</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Room</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Day</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map((course) => {
                    const teacher = teachers.find(t => t.id === course.teacherId);
                    const room = rooms.find(r => r.id === course.roomId);
                    return (
                      <tr key={course.id}>
                        <td className="border border-gray-300 px-3 py-2">{course.name}</td>
                        <td className="border border-gray-300 px-3 py-2">{teacher?.name || 'Unknown'}</td>
                        <td className="border border-gray-300 px-3 py-2">{room?.name || 'Unknown'}</td>
                        <td className="border border-gray-300 px-3 py-2">{course.day}</td>
                        <td className="border border-gray-300 px-3 py-2">{course.startTime} - {course.endTime}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

