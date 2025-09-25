import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AppContext';
import LoginForm from './LoginForm';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const isActive = (path) => location.pathname === path;

  const handleAuthClick = () => {
    setShowLoginForm(true);
  };

  const handleToggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleCloseAuth = () => {
    setShowLoginForm(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };
  
  return (
    <>
      <nav className="bg-white shadow-xl border-b border-purple-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center py-3">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-1.5 rounded-lg shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ClaimsPro</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Insurance Claims Management</p>
              </div>
            </div>
            
            {/* Navigation Links and Auth */}
            <div className="flex items-center space-x-4">
              {/* Main Navigation - only show if authenticated */}
              {isAuthenticated && (
                <div className="flex items-center space-x-1">
                  <Link 
                    to="/" 
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive('/') 
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm border border-purple-200' 
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Submit Claim</span>
                  </Link>
                  
                  <Link 
                    to="/review" 
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive('/review') 
                        ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 shadow-sm border border-blue-200' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Review Claims</span>
                  </Link>
                </div>
              )}

              {/* About Link - always visible */}
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive('/about') 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-sm border border-green-200' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>About</span>
              </Link>

              {/* Authentication Section */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block font-medium">
                      {user?.firstName || 'User'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {user?.email}
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        Notifications
                      </button>
                      <hr className="border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Login Form Modal */}
      {showLoginForm && (
        <LoginForm
          isLogin={isLogin}
          onToggle={handleToggleAuthMode}
          onClose={handleCloseAuth}
        />
      )}
    </>
  );
}
