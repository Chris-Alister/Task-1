import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, BookOpen, Users, BarChart3 } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isTeacher } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">
                Simplify3x Task
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-white">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-indigo-100 capitalize">{user?.role}</div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {isAdmin && (
              <a
                href="/admin"
                className="flex items-center space-x-2 py-4 px-2 border-b-3 border-blue-500 text-sm font-semibold text-blue-600 bg-blue-50 rounded-t-lg"
              >
                <Users className="h-5 w-5" />
                <span>Students</span>
              </a>
            )}
            
            {isTeacher && (
              <a
                href="/teacher"
                className="flex items-center space-x-2 py-4 px-2 border-b-3 border-green-500 text-sm font-semibold text-green-600 bg-green-50 rounded-t-lg"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Marks</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 