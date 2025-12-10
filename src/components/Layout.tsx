import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Layout: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans text-gray-900 overflow-hidden">
      <header className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm flex items-center justify-between shrink-0 z-10">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Policy Assistant</h1>
            <p className="text-xs text-gray-500">RAG & Voice Powered</p>
          </div>
        </Link>

        <div className="flex gap-3">
          {location.pathname !== '/admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </header>

      {/* This renders the child route components */}
      <Outlet />
    </div>
  );
};

export default Layout;