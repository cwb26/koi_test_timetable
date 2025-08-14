import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TimetableView from './components/TimetableView';
import CourseManagement from './components/CourseManagement';
import TeacherManagement from './components/TeacherManagement';
import RoomManagement from './components/RoomManagement';
import Reports from './components/Reports';
import ImportExport from './components/ImportExport';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetable" element={<TimetableView />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/teachers" element={<TeacherManagement />} />
        <Route path="/rooms" element={<RoomManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/import" element={<ImportExport />} />
      </Routes>
    </Layout>
  );
}

export default App;

