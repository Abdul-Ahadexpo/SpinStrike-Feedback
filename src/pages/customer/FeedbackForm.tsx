import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { Star, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

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
        // First, find the code in the database
        const codesRef = ref(database, 'codes');
        const snapshot = await get(codesRef);
        
        if (snapshot.exists()) {
          const codes = snapshot.val();
          let foundCodeKey = null;
          let foundCodeData = null;
          
          // Find the code that matches
          Object.keys(codes).forEach(key => {
            if (codes[key].code === code) {
              foundCodeKey = key;
              foundCodeData = codes[key];
            }
          });
          
          if (foundCodeKey && foundCodeData) {
            // Check if the code has already been used
            if (foundCodeData.used) {
              setCodeValid(false);
              toast.error('This feedback code has already been used');
            } else {
              setCodeData({
                id: foundCodeKey,
                ...foundCodeData
              });
              setCodeValid(true);
            }
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
    
    // Verify customer number matches
    if (customerNumber !== codeData.customerNumber) {
      toast.error('Customer number does not match the code');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Mark the code as used
      await update(ref(database, `codes/${codeData.id}`), {
        used: true
      });
      
      // Save the feedback
      const feedbackData = {
        employeeId: codeData.employeeId,
        employeeName: codeData.employeeName,
        customerName: codeData.customerName,
        customerNumber,
        rating,
        comment,
        createdAt: Date.now()
      };
      
      await update(ref(database, `feedback/${codeData.id}`), feedbackData);
      
      // Update employee points based on rating
      // Higher ratings give more points
      const pointsToAdd = Math.max(1, rating - 1); // 1 star = 1 point, 5 stars = 5 points
      
      const employeeRef = ref(database, `employees/${codeData.employeeId}`);
      const employeeSnapshot = await get(employeeRef);
      
      if (employeeSnapshot.exists()) {
        const employeeData = employeeSnapshot.val();
        const currentPoints = employeeData.points || 0;
        
        await update(ref(database, `employees/${codeData.employeeId}`), {
          points: currentPoints + pointsToAdd
        });
      }
      
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      // Reset form
      setRating(0);
      setComment('');
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
          Please share your experience with {codeData?.employeeName}
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