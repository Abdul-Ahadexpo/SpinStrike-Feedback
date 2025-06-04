import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Award, Menu, X, LogOut, MessageSquare, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
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
    <>
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
              
              <Link
                to="/feedback"
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                  location.pathname === '/feedback' ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Submit Feedback
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

              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-primary"
                title="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-gray-600 hover:text-primary"
                title="Help"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
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
              
              <Link
                to="/feedback"
                className={`block py-2 text-base font-medium ${
                  location.pathname === '/feedback' ? 'text-primary' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Submit Feedback
                </div>
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

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">How to Use SpinStrike Feedback</h2>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* For Customers */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">For Customers</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-700">1. Get a feedback code from your service provider</p>
                    <p className="text-gray-700">2. Click "Submit Feedback" in the navigation bar</p>
                    <p className="text-gray-700">3. Enter your feedback code</p>
                    <p className="text-gray-700">4. Rate your experience and provide comments</p>
                    <p className="text-gray-700">5. Submit your feedback to help improve our service</p>
                  </div>
                </div>

                {/* For Employees */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">For Employees</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-700">1. Log in to your Employee Portal</p>
                    <p className="text-gray-700">2. Generate feedback codes for your customers</p>
                    <p className="text-gray-700">3. Share the feedback link with customers</p>
                    <p className="text-gray-700">4. Track your feedback and performance</p>
                    <p className="text-gray-700">5. View your points and ranking on the leaderboard</p>
                  </div>
                </div>

                {/* For Administrators */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">For Administrators</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-700">1. Access the Admin Panel</p>
                    <p className="text-gray-700">2. Manage employee accounts and permissions</p>
                    <p className="text-gray-700">3. Monitor feedback and performance metrics</p>
                    <p className="text-gray-700">4. Configure points distribution settings</p>
                    <p className="text-gray-700">5. Handle system settings and maintenance</p>
                  </div>
                </div>

                {/* Points System */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">Points System (SSP)</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-700">• Monthly pool of 100 SpinStrike Points (SSP)</p>
                    <p className="text-gray-700">• 1st Place: 40 SSP</p>
                    <p className="text-gray-700">• 2nd Place: 30 SSP</p>
                    <p className="text-gray-700">• 3rd Place: 15 SSP</p>
                    <p className="text-gray-700">• Remaining points distributed among other employees</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
