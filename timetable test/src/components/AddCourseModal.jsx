import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { X, BookOpen, User, MapPin, Clock, Calendar } from 'lucide-react';

const AddCourseModal = ({ isOpen, onClose }) => {
  const { addCourse, teachers, rooms, selectedYear, selectedTrimester } = useTimetable();
  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    roomId: '',
    day: '',
    startTime: '',
    endTime: '',
    year: selectedYear,
    trimester: selectedTrimester
  });
  const [errors, setErrors] = useState({});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];
  const years = ['2025', '2026', '2027'];
  const trimesters = ['1', '2', '3', 'Intensive'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!formData.teacherId) {
      newErrors.teacherId = 'Please select a teacher';
    }

    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!formData.day) {
      newErrors.day = 'Please select a day';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (!formData.year) {
      newErrors.year = 'Please select a year';
    }

    if (!formData.trimester) {
      newErrors.trimester = 'Please select a trimester';
    }

    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    addCourse(formData);
    setFormData({
      name: '',
      teacherId: '',
      roomId: '',
      day: '',
      startTime: '',
      endTime: '',
      year: selectedYear,
      trimester: selectedTrimester
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      teacherId: '',
      roomId: '',
      day: '',
      startTime: '',
      endTime: '',
      year: selectedYear,
      trimester: selectedTrimester
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                Add New Course
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Course Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter course name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Teacher Selection */}
              <div>
                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">
                  Teacher
                </label>
                <select
                  id="teacherId"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.teacherId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.department})
                    </option>
                  ))}
                </select>
                {errors.teacherId && (
                  <p className="mt-1 text-sm text-red-600">{errors.teacherId}</p>
                )}
              </div>

              {/* Room Selection */}
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.roomId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.building} (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>
                )}
              </div>

              {/* Day Selection */}
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                  Day
                </label>
                <select
                  id="day"
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.day ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {errors.day && (
                  <p className="mt-1 text-sm text-red-600">{errors.day}</p>
                )}
              </div>

              {/* Year and Trimester Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Academic Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`mt-1 input ${errors.year ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="trimester" className="block text-sm font-medium text-gray-700">
                    Trimester
                  </label>
                  <select
                    id="trimester"
                    name="trimester"
                    value={formData.trimester}
                    onChange={handleChange}
                    className={`mt-1 input ${errors.trimester ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select trimester</option>
                    {trimesters.map(trimester => (
                      <option key={trimester} value={trimester}>Trimester {trimester}</option>
                    ))}
                  </select>
                  {errors.trimester && (
                    <p className="mt-1 text-sm text-red-600">{errors.trimester}</p>
                  )}
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <select
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={`mt-1 input ${errors.startTime ? 'border-red-500' : ''}`}
                  >
                    <option value="">Start time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <select
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`mt-1 input ${errors.endTime ? 'border-red-500' : ''}`}
                  >
                    <option value="">End time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {selectedYear} - Trimester {selectedTrimester}
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Modal Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary w-full sm:w-auto sm:ml-3"
            >
              Add Course
            </button>
            <button
              type="button"
              onClick={handleClose}
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

export default AddCourseModal;

