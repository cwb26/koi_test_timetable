import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimetable } from '../contexts/TimetableContext';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen,
  Building2,
  Calendar
} from 'lucide-react';

const TeacherManagement = () => {
  const { hasPermission } = useAuth();
  const { 
    teachers, 
    courses, 
    addTeacher, 
    updateTeacher, 
    deleteTeacher 
  } = useTimetable();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeacherCourses = (teacherId) => {
    return courses.filter(course => course.teacherId === teacherId);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
  };

  const handleSave = (teacherData) => {
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, teacherData);
      setEditingTeacher(null);
    } else {
      addTeacher(teacherData);
      setShowAddModal(false);
    }
  };

  const handleDelete = (teacherId) => {
    const teacherCourses = getTeacherCourses(teacherId);
    if (teacherCourses.length > 0) {
      alert(`Cannot delete teacher. They are assigned to ${teacherCourses.length} course(s).`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      deleteTeacher(teacherId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-600">
            Manage faculty members and their course assignments
          </p>
        </div>
        
        {hasPermission('create') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Teachers
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
            placeholder="Search by name or department..."
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => {
          const teacherCourses = getTeacherCourses(teacher.id);
          const isEditing = editingTeacher?.id === teacher.id;
          
          return (
            <div key={teacher.id} className="bg-white rounded-lg shadow p-6">
              {isEditing ? (
                <TeacherEditForm
                  teacher={teacher}
                  onSave={handleSave}
                  onCancel={() => setEditingTeacher(null)}
                />
              ) : (
                <>
                  {/* Teacher Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {teacher.department}
                      </p>
                    </div>
                  </div>

                  {/* Course Count */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>
                        {teacherCourses.length} course{teacherCourses.length !== 1 ? 's' : ''} assigned
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {hasPermission('edit') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="btn btn-outline flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      
                      {hasPermission('delete') && (
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="btn btn-outline text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No teachers found</p>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first teacher'}
          </p>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <TeacherModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Teacher Edit Form Component
const TeacherEditForm = ({ teacher, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: teacher.name,
    department: teacher.department
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="input"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <input
          type="text"
          value={formData.department}
          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          className="input"
          required
        />
      </div>
      
      <div className="flex space-x-2">
        <button type="submit" className="btn btn-primary flex-1">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
};

// Teacher Modal Component
const TeacherModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', department: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Teacher
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Enter teacher name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="input"
                  placeholder="Enter department"
                  required
                />
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary w-full sm:w-auto sm:ml-3"
            >
              Add Teacher
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;

