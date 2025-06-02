import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Award, Settings } from 'lucide-react';
import EmployeeManagement from './EmployeeManagement';
import PointsManagement from './PointsManagement';
import SystemSettings from './SystemSettings';

const AdminPanel: React.FC = () => {
  const location = useLocation();
  
  // Define the navigation items
  const navItems = [
    {
      path: '/admin/employees',
      label: 'Employees',
      icon: <Users className="h-5 w-5" />,
      component: <EmployeeManagement />,
    },
    {
      path: '/admin/points',
      label: 'Points',
      icon: <Award className="h-5 w-5" />,
      component: <PointsManagement />,
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      component: <SystemSettings />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Manage employees, points distribution, and system settings
        </p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm transition-colors ${
                location.pathname === item.path || 
                (location.pathname === '/admin' && item.path === '/admin/employees')
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
          <Route path="/" element={<EmployeeManagement />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/points" element={<PointsManagement />} />
          <Route path="/settings" element={<SystemSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;