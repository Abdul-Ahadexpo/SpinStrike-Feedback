import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Award, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">SpinStrike Feedback</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            
            {userRole === 'admin' ? (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname.includes('/admin') ? 'text-primary' : 'text-gray-600'
                }`}
              >
                Admin Panel
              </Link>
            ) : userRole === 'employee' ? (
              <Link
                to="/employee"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname.includes('/employee') ? 'text-primary' : 'text-gray-600'
                }`}
              >
                Employee Portal
              </Link>
            ) : (
              <>
                <Link
                  to="/admin/login"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/admin/login' ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  Admin Login
                </Link>
                <Link
                  to="/employee/login"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/employee/login' ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  Employee Login
                </Link>
              </>
            )}
            
            {currentUser && (
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-primary"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <Link
              to="/"
              className={`block py-2 text-base font-medium ${
                location.pathname === '/' ? 'text-primary' : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {userRole === 'admin' ? (
              <Link
                to="/admin"
                className={`block py-2 text-base font-medium ${
                  location.pathname.includes('/admin') ? 'text-primary' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Panel
              </Link>
            ) : userRole === 'employee' ? (
              <Link
                to="/employee"
                className={`block py-2 text-base font-medium ${
                  location.pathname.includes('/employee') ? 'text-primary' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Employee Portal
              </Link>
            ) : (
              <>
                <Link
                  to="/admin/login"
                  className={`block py-2 text-base font-medium ${
                    location.pathname === '/admin/login' ? 'text-primary' : 'text-gray-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Login
                </Link>
                <Link
                  to="/employee/login"
                  className={`block py-2 text-base font-medium ${
                    location.pathname === '/employee/login' ? 'text-primary' : 'text-gray-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Employee Login
                </Link>
              </>
            )}
            
            {currentUser && (
              <button
                onClick={handleLogout}
                className="flex items-center w-full py-2 text-base font-medium text-gray-600 hover:text-primary"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;