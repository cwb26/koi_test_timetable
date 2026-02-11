import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTimetable } from '../contexts/TimetableContext';
import YearManagement from './YearManagement';
import { 
  Calendar, 
  BookOpen, 
  Users, 
  Building2, 
  AlertTriangle,
  Plus,
  Eye,
  Download
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const { 
    courses, 
    teachers, 
    rooms, 
    conflicts, 
    selectedYear, 
    selectedTrimester,
    getFilteredCourses 
  } = useTimetable();

  const currentCourses = getFilteredCourses();
  const totalCourses = currentCourses.length;
  const totalTeachers = teachers.length;
  const totalRooms = rooms.length;
  const totalConflicts = conflicts.length;

  const stats = [
    {
      name: 'Total Courses',
      value: totalCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
      href: '/courses'
    },
    {
      name: 'Total Teachers',
      value: totalTeachers,
      icon: Users,
      color: 'bg-green-500',
      href: '/teachers'
    },
    {
      name: 'Total Rooms',
      value: totalRooms,
      icon: Building2,
      color: 'bg-purple-500',
      href: '/rooms'
    },
    {
      name: 'Active Conflicts',
      value: totalConflicts,
      icon: AlertTriangle,
      color: totalConflicts > 0 ? 'bg-red-500' : 'bg-gray-500',
      href: '/timetable'
    }
  ];

  const quickActions = [
    {
      name: 'View Timetable',
      description: 'See the current schedule',
      icon: Eye,
      href: '/timetable',
      color: 'bg-blue-500'
    },
    {
      name: 'Add Course',
      description: 'Create a new course',
      icon: Plus,
      href: '/courses',
      color: 'bg-green-500',
      requiresPermission: 'create'
    },
    {
      name: 'Export Schedule',
      description: 'Download current timetable',
      icon: Download,
      href: '/reports',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your timetable for {selectedYear} - Trimester {selectedTrimester}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              if (action.requiresPermission && !hasPermission(action.requiresPermission)) {
                return null;
              }
              
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="group relative bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                        {action.name}
                      </p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity & Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Courses</h2>
          </div>
          <div className="p-6">
            {currentCourses.length > 0 ? (
              <div className="space-y-3">
                {currentCourses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.name}</p>
                      <p className="text-xs text-gray-500">
                        {course.day} • {course.startTime} - {course.endTime}
                      </p>
                    </div>
                    <Link
                      to="/timetable"
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No courses scheduled yet</p>
            )}
          </div>
        </div>

        {/* Active Conflicts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Active Conflicts</h2>
          </div>
          <div className="p-6">
            {conflicts.length > 0 ? (
              <div className="space-y-3">
                {conflicts.slice(0, 5).map((conflict, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-800">{conflict.message}</p>
                        <p className="text-xs text-red-600 mt-1">
                          {conflict.courses.map(c => c.name).join(' vs ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-green-800 font-medium">No conflicts detected</p>
                <p className="text-green-600 text-sm">Your timetable is conflict-free!</p>
              </div>
            )}
          </div>
        </div>

        {/* Year Management (Admin Only) */}
        <YearManagement />
      </div>
    </div>
  );
};

export default Dashboard;

