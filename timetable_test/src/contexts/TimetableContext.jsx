import React, { createContext, useContext, useState, useEffect } from 'react';
import { coursesAPI, teachersAPI, roomsAPI, conflictsAPI, statsAPI, academicYearsAPI, handleAPIError } from '../services/api';
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
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedTrimester, setSelectedTrimester] = useState('1');
  const [conflicts, setConflicts] = useState([]);

  // Load data from API on mount (only if authenticated)
  useEffect(() => {
    const loadData = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        return; // Don't load data if not authenticated
      }

      try {
        const [teachersData, roomsData, yearsData] = await Promise.all([
          teachersAPI.getAll(),
          roomsAPI.getAll(),
          academicYearsAPI.getAll()
        ]);
        
        setTeachers(teachersData);
        setRooms(roomsData);
        setAcademicYears(yearsData);
        
        // Set default year to first available year if exists
        if (yearsData.length > 0) {
          const firstYear = yearsData[0].year.toString();
          setSelectedYear(firstYear);
          console.log('Academic years loaded:', yearsData);
          console.log('Selected year set to:', firstYear);
        } else {
          console.warn('No academic years found in database!');
        }
      } catch (error) {
        const errorMessage = handleAPIError(error);
        console.error('Error loading data:', error);
        // Only show error if it's not an auth error (auth errors are handled by handleAPIError)
        if (!error.message.includes('401') && !error.message.includes('403')) {
          toast.error(`Failed to load data: ${errorMessage}`);
        }
      }
    };

    loadData();
  }, []);



  // Transform backend data (snake_case) to frontend format (camelCase)
  const transformCourse = (course) => ({
    ...course,
    teacherId: course.teacher_id,
    roomId: course.room_id,
    startTime: course.start_time,
    endTime: course.end_time,
    teacherName: course.teacher_name,
    roomName: course.room_name,
    roomBuilding: course.room_building
  });

  // Load courses and check for conflicts when year/trimester changes
  useEffect(() => {
    const loadCourses = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        return; // Don't load courses if not authenticated
      }

      try {
        const coursesData = await coursesAPI.getAll({
          year: selectedYear,
          trimester: selectedTrimester
        });
        
        // Transform courses to camelCase
        const transformedCourses = coursesData.map(transformCourse);
        setCourses(transformedCourses);
        
        // Get conflicts from API
        const conflictsData = await conflictsAPI.getConflicts(selectedYear, selectedTrimester);
        setConflicts(conflictsData);
      } catch (error) {
        const errorMessage = handleAPIError(error);
        // Only show error if it's not an auth error
        if (!error.message.includes('401') && !error.message.includes('403')) {
          toast.error(`Failed to load courses: ${errorMessage}`);
        }
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
      const transformedCourse = transformCourse(newCourse);
      setCourses(prev => [...prev, transformedCourse]);
      toast.success('Course added successfully');
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to add course: ${errorMessage}`);
    }
  };

  const updateCourse = async (id, updates) => {
    try {
      const updatedCourse = await coursesAPI.update(id, updates);
      const transformedCourse = transformCourse(updatedCourse);
      setCourses(prev => prev.map(course => 
        course.id === id ? transformedCourse : course
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

  const addAcademicYear = async (year) => {
    try {
      const newYear = await academicYearsAPI.create(year);
      setAcademicYears(prev => [newYear, ...prev].sort((a, b) => b.year - a.year));
      toast.success(`Year ${year} added successfully`);
      return true;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to add year: ${errorMessage}`);
      return false;
    }
  };

  const deleteAcademicYear = async (year) => {
    try {
      await academicYearsAPI.delete(year);
      setAcademicYears(prev => prev.filter(y => y.year !== parseInt(year)));
      toast.success(`Year ${year} deleted successfully`);
      return true;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(`Failed to delete year: ${errorMessage}`);
      return false;
    }
  };

  const value = {
    // State
    courses,
    teachers,
    rooms,
    academicYears,
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
    addAcademicYear,
    deleteAcademicYear,
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
