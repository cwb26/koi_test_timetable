import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimetable } from '../contexts/TimetableContext';
import { Edit2, Trash2, User, MapPin, Clock } from 'lucide-react';

const CourseCard = ({ course, isConflict = false }) => {
  const { hasPermission } = useAuth();
  const { updateCourse, deleteCourse, teachers, rooms } = useTimetable();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: course.name,
    teacherId: course.teacherId,
    roomId: course.roomId,
    startTime: course.startTime,
    endTime: course.endTime
  });

  const teacher = teachers.find(t => t.id === course.teacherId);
  const room = rooms.find(r => r.id === course.roomId);

  const handleEdit = () => {
    if (!hasPermission('edit')) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    updateCourse(course.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: course.name,
      teacherId: course.teacherId,
      roomId: course.roomId,
      startTime: course.startTime,
      endTime: course.endTime
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!hasPermission('delete')) return;
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(course.id);
    }
  };

  if (isEditing) {
    return (
      <div className={`p-2 rounded text-xs ${isConflict ? 'conflict-warning' : 'course-card'}`}>
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
          className="input w-full mb-2 text-xs"
          placeholder="Course name"
        />
        
        <select
          value={editData.teacherId}
          onChange={(e) => setEditData(prev => ({ ...prev, teacherId: parseInt(e.target.value) }))}
          className="input w-full mb-2 text-xs"
        >
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        
        <select
          value={editData.roomId}
          onChange={(e) => setEditData(prev => ({ ...prev, roomId: parseInt(e.target.value) }))}
          className="input w-full mb-2 text-xs"
        >
          {rooms.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        
        <div className="flex gap-1 mb-2">
          <input
            type="time"
            value={editData.startTime}
            onChange={(e) => setEditData(prev => ({ ...prev, startTime: e.target.value }))}
            className="input flex-1 text-xs"
          />
          <input
            type="time"
            value={editData.endTime}
            onChange={(e) => setEditData(prev => ({ ...prev, endTime: e.target.value }))}
            className="input flex-1 text-xs"
          />
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="btn btn-primary text-xs px-2 py-1 flex-1"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-secondary text-xs px-2 py-1 flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-2 rounded text-xs ${isConflict ? 'conflict-warning' : 'course-card'}`}>
      <div className="font-medium text-gray-900 mb-1">{course.name}</div>
      
      <div className="space-y-1 text-gray-600">
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          <span className="truncate">{teacher?.name || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{room?.name || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{course.startTime} - {course.endTime}</span>
        </div>
      </div>
      
      {hasPermission('edit') && (
        <div className="flex gap-1 mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={handleEdit}
            className="btn btn-outline text-xs px-2 py-1 flex-1"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </button>
          
          {hasPermission('delete') && (
            <button
              onClick={handleDelete}
              className="btn btn-outline text-xs px-2 py-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      
      {isConflict && (
        <div className="mt-2 text-xs text-red-600 font-medium">
          ⚠️ Conflict detected
        </div>
      )}
    </div>
  );
};

export default CourseCard;
