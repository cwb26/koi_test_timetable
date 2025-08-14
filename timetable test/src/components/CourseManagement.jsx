import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimetable } from '../contexts/TimetableContext';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import AddCourseModal from './AddCourseModal';

const CourseManagement = () => {
  const { hasPermission } = useAuth();
  const { 
    courses, 
    teachers, 
    rooms, 
    selectedYear, 
    selectedTrimester,
    getFilteredCourses,
    deleteCourse 
  } = useTimetable();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    teacherId: '',
    roomId: '',
    day: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentCourses = getFilteredCourses(filters);
  
  // Filter courses by search term
  const filteredCourses = currentCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teachers.find(t => t.id === course.teacherId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rooms.find(r => r.id === course.roomId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
    }
  };

  const clearFilters = () => {
    setFilters({
      teacherId: '',
      roomId: '',
      day: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">
            Manage all courses for {selectedYear} - Trimester {selectedTrimester}
          </p>
        </div>
        
        {hasPermission('create') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Courses
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search by course name, teacher, or room..."
              />
            </div>
          </div>

          {/* Teacher Filter */}
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

          {/* Day Filter */}
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

        {/* Filter Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            <span>
              Showing {filteredCourses.length} of {currentCourses.length} courses
            </span>
          </div>
          
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const teacher = teachers.find(t => t.id === course.teacherId);
                  const room = rooms.find(r => r.id === course.roomId);
                  
                  return (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {course.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {teacher?.name || 'Unknown'}
                          </div>
                        </div>
                        {teacher && (
                          <div className="text-sm text-gray-500">
                            {teacher.department}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {room?.name || 'Unknown'}
                          </div>
                        </div>
                        {room && (
                          <div className="text-sm text-gray-500">
                            {room.building} (Capacity: {room.capacity})
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {course.day}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.startTime} - {course.endTime}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {hasPermission('edit') && (
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          
                          {hasPermission('delete') && (
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No courses found</p>
                      <p className="text-sm">
                        {searchTerm || Object.values(filters).some(f => f) 
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first course'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
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

export default CourseManagement;

