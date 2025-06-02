import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { User, Award, QrCode } from 'lucide-react';
import EmployeeProfile from './EmployeeProfile';
import FeedbackCodes from './FeedbackCodes';
import EmployeeStats from './EmployeeStats';

const EmployeePanel: React.FC = () => {
  const location = useLocation();
  
  // Define the navigation items
  const navItems = [
    {
      path: '/employee/profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      component: <EmployeeProfile />,
    },
    {
      path: '/employee/codes',
      label: 'Feedback Codes',
      icon: <QrCode className="h-5 w-5" />,
      component: <FeedbackCodes />,
    },
    {
      path: '/employee/stats',
      label: 'My Stats',
      icon: <Award className="h-5 w-5" />,
      component: <EmployeeStats />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Portal</h1>
        <p className="text-gray-600 mt-2">
          Manage your profile, generate feedback codes, and view your stats
        </p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                location.pathname === item.path || 
                (location.pathname === '/employee' && item.path === '/employee/profile')
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Routes>
          <Route path="/" element={<EmployeeProfile />} />
          <Route path="/profile" element={<EmployeeProfile />} />
          <Route path="/codes" element={<FeedbackCodes />} />
          <Route path="/stats" element={<EmployeeStats />} />
        </Routes>
      </div>
    </div>
  );
};

export default EmployeePanel;