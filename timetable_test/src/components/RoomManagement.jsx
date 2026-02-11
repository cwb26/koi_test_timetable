import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimetable } from '../contexts/TimetableContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

const RoomManagement = () => {
  const { hasPermission } = useAuth();
  const { 
    rooms, 
    courses, 
    addRoom, 
    updateRoom, 
    deleteRoom 
  } = useTimetable();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoomCourses = (roomId) => {
    return courses.filter(course => course.roomId === roomId);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
  };

  const handleSave = (roomData) => {
    if (editingRoom) {
      updateRoom(editingRoom.id, roomData);
      setEditingRoom(null);
    } else {
      addRoom(roomData);
      setShowAddModal(false);
    }
  };

  const handleDelete = (roomId) => {
    const roomCourses = getRoomCourses(roomId);
    if (roomCourses.length > 0) {
      alert(`Cannot delete room. It is assigned to ${roomCourses.length} course(s).`);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteRoom(roomId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600">
            Manage classrooms and their capacity
          </p>
        </div>
        
        {hasPermission('create') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Rooms
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
            placeholder="Search by room name or building..."
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const roomCourses = getRoomCourses(room.id);
          const isEditing = editingRoom?.id === room.id;
          
          return (
            <div key={room.id} className="bg-white rounded-lg shadow p-6">
              {isEditing ? (
                <RoomEditForm
                  room={room}
                  onSave={handleSave}
                  onCancel={() => setEditingRoom(null)}
                />
              ) : (
                <>
                  {/* Room Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {room.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {room.building}
                      </p>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Capacity: {room.capacity} students</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {roomCourses.length} course{roomCourses.length !== 1 ? 's' : ''} scheduled
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {hasPermission('edit') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="btn btn-outline flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      
                      {hasPermission('delete') && (
                        <button
                          onClick={() => handleDelete(room.id)}
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
      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">No rooms found</p>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first room'}
          </p>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <RoomModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Room Edit Form Component
const RoomEditForm = ({ room, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: room.name,
    building: room.building,
    capacity: room.capacity
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room Name
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
          Building
        </label>
        <input
          type="text"
          value={formData.building}
          onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
          className="input"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacity
        </label>
        <input
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
          className="input"
          min="1"
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

// Room Modal Component
const RoomModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    capacity: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', building: '', capacity: '' });
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
              Add New Room
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="e.g., Room 101, Lab A"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building
                </label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                  className="input"
                  placeholder="e.g., Main Building, Science Wing"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  className="input"
                  placeholder="Number of students"
                  min="1"
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
              Add Room
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

export default RoomManagement;

