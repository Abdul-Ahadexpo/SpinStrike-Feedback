import React from 'react';
import { Award } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center mb-4 md:mb-0">
            <Award className="h-6 w-6 text-primary mr-2" />
            <span className="text-sm font-medium text-gray-600">
              SpinStrike Feedback &copy; {currentYear}
            </span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-primary">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;