import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, remove, set, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { Star, Send, CheckCircle, AlertTriangle, Search, User } from 'lucide-react';
import { toast } from 'react-toastify';

interface Employee {
  id: string;
  name: string;
  email: string;
  points: number;
}

const FeedbackForm: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [codeData, setCodeData] = useState<any>(null);
  const [customerNumber, setCustomerNumber] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [codeValid, setCodeValid] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  // New state for employee selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesRef = ref(database, 'employees');
        const snapshot = await get(employeesRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const employeeList: Employee[] = [];
          
          Object.keys(data).forEach(key => {
            if (data[key].name) {
              employeeList.push({
                id: key,
                name: data[key].name,
                email: key.replace(/,/g, '.'),
                points: data[key].points || 0
              });
            }
          });
          
          setEmployees(employeeList);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      }
    };
    
    fetchEmployees();
  }, []);

  // Fetch code data
  useEffect(() => {
    const fetchCodeData = async () => {
      if (!code) {
        setCodeValid(false);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const codesRef = ref(database, 'codes');
        const snapshot = await get(codesRef);
        
        if (snapshot.exists()) {
          const codes = snapshot.val();
          let foundCodeKey = null;
          let foundCodeData = null;
          
          Object.keys(codes).forEach(key => {
            if (codes[key].code === code) {
              foundCodeKey = key;
              foundCodeData = codes[key];
            }
          });
          
          if (foundCodeKey && foundCodeData) {
            setCodeData({
              id: foundCodeKey,
              ...foundCodeData
            });
            setCodeValid(true);
          } else {
            setCodeValid(false);
            toast.error('Invalid feedback code');
          }
        } else {
          setCodeValid(false);
          toast.error('Invalid feedback code');
        }
      } catch (error) {
        console.error('Error fetching code data:', error);
        setCodeValid(false);
        toast.error('Error validating feedback code');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCodeData();
  }, [code]);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!customerNumber) {
      toast.error('Please enter your customer number');
      return;
    }
    
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    
    // Verify customer number matches
    if (customerNumber !== codeData.customerNumber) {
      toast.error('Customer number does not match the code');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Save the feedback first
      const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
      const feedbackData = {
        employeeId: selectedEmployee,
        employeeName: selectedEmployeeData?.name,
        customerName: codeData.customerName,
        customerNumber,
        rating,
        comment,
        createdAt: Date.now()
      };
      
      // Update employee points based on rating
      // Higher ratings give more points
      const pointsToAdd = Math.max(1, rating - 1); // 1 star = 1 point, 5 stars = 5 points
      
      const employeeRef = ref(database, `employees/${selectedEmployee}`);
      const employeeSnapshot = await get(employeeRef);
      
      if (employeeSnapshot.exists()) {
        const employeeData = employeeSnapshot.val();
        const currentPoints = employeeData.points || 0;
        
        await remove(ref(database, `codes/${codeData.id}`)); // Delete the code
        await set(ref(database, `feedback/${codeData.id}`), feedbackData);
        await update(ref(database, `employees/${selectedEmployee}`), {
          points: currentPoints + pointsToAdd
        });
      }
      
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      // Reset form
      setRating(0);
      setComment('');
      setSelectedEmployee('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Validating feedback code...</p>
      </div>
    );
  }

  if (!codeValid) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <AlertTriangle className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Code</h2>
          <p className="text-gray-600 mb-6">
            This feedback code is invalid or has already been used.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
        <p className="text-gray-600 mt-2">
          Please share your experience with our team
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={codeData?.customerName}
              className="input bg-gray-50"
              disabled
            />
          </div>
          
          <div>
            <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Your Customer Number
            </label>
            <input
              id="customerNumber"
              type="text"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              className="input"
              placeholder="Enter your customer number"
            />
            <p className="mt-1 text-sm text-gray-500">
              Please enter the number provided to you by the employee
            </p>
          </div>
          
          {/* Employee Selection */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Employee
            </label>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search employee by name..."
              />
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredEmployees.map((employee) => (
                <label
                  key={employee.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEmployee === employee.id
                      ? 'bg-primary/10 border border-primary'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="employee"
                    value={employee.id}
                    checked={selectedEmployee === employee.id}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="sr-only"
                  />
                  <User className={`h-5 w-5 mr-3 ${
                    selectedEmployee === employee.id ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      selectedEmployee === employee.id ? 'text-primary' : 'text-gray-900'
                    }`}>
                      {employee.name}
                    </p>
                  </div>
                </label>
              ))}
              
              {filteredEmployees.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No employees found matching your search
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate your experience?
            </label>
            <div className="flex justify-center items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center mt-2 text-sm text-gray-500">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
              {rating === 0 && 'Select a rating'}
            </p>
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Comments (Optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input"
              placeholder="Share your thoughts about your experience..."
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;