import React, { createContext, useContext, useState, useEffect } from 'react';
import { coursesAPI, teachersAPI, roomsAPI, conflictsAPI, statsAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';

const TimetableContext = createContext();

export const useTimetable = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
};

export const TimetableProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedTrimester, setSelectedTrimester] = useState('2');
  const [conflicts, setConflicts] = useState([]);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersData, roomsData] = await Promise.all([
          teachersAPI.getAll(),
          roomsAPI.getAll()
        ]);
        
        setTeachers(teachersData);
        setRooms(roomsData);
      } catch (error) {
        const errorMessage = handleAPIError(error);
        toast.error(`Failed to load data: ${errorMessage}`);
      }
    };

    loadData();
  }, []);



  // Load courses and check for conflicts when year/trimester changes
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await coursesAPI.getAll({
          year: selectedYear,
          trimester: selectedTrimester
        });
        setCourses(coursesData);
        
        // Get conflicts from API
        const conflictsData = await conflictsAPI.getConflicts(selectedYear, selectedTrimester);
        setConflicts(conflictsData);
      } catch (error) {
        const errorMessage = handleAPIError(error);
        toast.error(`Failed to load courses: ${errorMessage}`);
      }
    };

    if (selectedYear && selectedTrimester) {
      loadCourses();
    }
  }, [selectedYear, selectedTrimester]);

  const detectConflicts = (courseList) => {
    const conflicts = [];
    
    for (let i = 0; i < courseList.length; i++) {
      for (let j = i + 1; j < courseList.length; j++) {
        const course1 = courseList[i];
        const course2 = courseList[j];
        
        // Check if courses are in the same time slot
        if (course1.day === course2.day && 
            course1.startTime === course2.startTime &&
            course1.year === course2.year &&
            course1.trimester === course2.trimester) {
          
          // Check for teacher conflicts
          if (course1.teacherId === course2.teacherId) {
            conflicts.push({
              type: 'teacher',
              message: `Teacher conflict: ${course1.name} and ${course2.name} at the same time`,
              courses: [course1, course2]
            });
          }
          
          // Check for room conflicts
          if (course1.roomId === course2.roomId) {
            conflicts.push({
              type: 'room',
              message: `Room conflict: ${course1.name} and ${course2.name} in the same room`,
              courses: [course1, course2]
            });
          }
        }
      }
    }
    
    return conflicts;
  };

  const addCourse = async (courseData) => {
    try {
      const courseWithYearTrimester = {
        name: courseData.name,
        teacher_id: parseInt(courseData.teacherId),
        room_id: parseInt(courseData.roomId),
        day: courseData.day,
        start_time: courseData.startTime,
        end_time: courseData.endTime,
        year: parseInt(courseData.year),
        trimester: parseInt(courseData.trimester)
      };
      
      const newCourse = await coursesAPI.create(courseWithYearTrimester);
      setCourses(prev => [...prev, newCourse]);
      toast.success('Course added successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to add course: ${errorMessage}`);
    }
  };

  const updateCourse = async (id, updates) => {
    try {
      const updatedCourse = await coursesAPI.update(id, updates);
      setCourses(prev => prev.map(course => 
        course.id === id ? updatedCourse : course
      ));
      toast.success('Course updated successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to update course: ${errorMessage}`);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await coursesAPI.delete(id);
      setCourses(prev => prev.filter(course => course.id !== id));
      toast.success('Course deleted successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to delete course: ${errorMessage}`);
    }
  };

  const addTeacher = async (teacherData) => {
    try {
      const newTeacher = await teachersAPI.create(teacherData);
      setTeachers(prev => [...prev, newTeacher]);
      toast.success('Teacher added successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to add teacher: ${errorMessage}`);
    }
  };

  const updateTeacher = async (id, updates) => {
    try {
      const updatedTeacher = await teachersAPI.update(id, updates);
      setTeachers(prev => prev.map(teacher => 
        teacher.id === id ? updatedTeacher : teacher
      ));
      toast.success('Teacher updated successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to update teacher: ${errorMessage}`);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await teachersAPI.delete(id);
      setTeachers(prev => prev.filter(teacher => teacher.id !== id));
      toast.success('Teacher deleted successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to delete teacher: ${errorMessage}`);
    }
  };

  const addRoom = async (roomData) => {
    try {
      const newRoom = await roomsAPI.create(roomData);
      setRooms(prev => [...prev, newRoom]);
      toast.success('Room added successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to add room: ${errorMessage}`);
    }
  };

  const updateRoom = async (id, updates) => {
    try {
      const updatedRoom = await roomsAPI.update(id, updates);
      setRooms(prev => prev.map(room => 
        room.id === id ? updatedRoom : room
      ));
      toast.success('Room updated successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to update room: ${errorMessage}`);
    }
  };

  const deleteRoom = async (id) => {
    try {
      await roomsAPI.delete(id);
      setRooms(prev => prev.filter(room => room.id !== id));
      toast.success('Room deleted successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to delete room: ${errorMessage}`);
    }
  };

  const getFilteredCourses = (filters = {}) => {
    let filtered = courses.filter(course => 
      course.year === parseInt(selectedYear) && course.trimester === parseInt(selectedTrimester)
    );

    if (filters.teacherId) {
      filtered = filtered.filter(course => course.teacher_id === filters.teacherId);
    }

    if (filters.roomId) {
      filtered = filtered.filter(course => course.room_id === filters.roomId);
    }

    if (filters.day) {
      filtered = filtered.filter(course => course.day === filters.day);
    }

    return filtered;
  };

  const value = {
    // State
    courses,
    teachers,
    rooms,
    selectedYear,
    selectedTrimester,
    conflicts,
    
    // Setters
    setSelectedYear,
    setSelectedTrimester,
    
    // Actions
    addCourse,
    updateCourse,
    deleteCourse,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addRoom,
    updateRoom,
    deleteRoom,
    getFilteredCourses,
    
    // Utilities
    detectConflicts
  };

  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
};
