import React, { useState, useEffect } from 'react';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../firebase/config';
import { LineChart, BarChart, Activity, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface Feedback {
  id: string;
  customerName: string;
  customerNumber: string;
  rating: number;
  comment: string;
  createdAt: number;
}

interface RatingCount {
  star: number;
  count: number;
}

const EmployeeStats: React.FC = () => {
  const { currentUser } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<RatingCount[]>([]);

  // Fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      
      try {
        const feedbackRef = query(
          ref(database, 'feedback'),
          orderByChild('employeeId'),
          equalTo(currentUser.id)
        );
        
        const snapshot = await get(feedbackRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const feedbackList: Feedback[] = [];
          
          Object.keys(data).forEach(key => {
            feedbackList.push({
              id: key,
              ...data[key]
            });
          });
          
          // Sort by creation date (newest first)
          feedbackList.sort((a, b) => b.createdAt - a.createdAt);
          
          setFeedback(feedbackList);
          setTotalFeedback(feedbackList.length);
          
          // Calculate average rating
          if (feedbackList.length > 0) {
            const sum = feedbackList.reduce((acc, item) => acc + item.rating, 0);
            setAverageRating(sum / feedbackList.length);
          }
          
          // Calculate rating counts
          const counts: RatingCount[] = [
            { star: 5, count: 0 },
            { star: 4, count: 0 },
            { star: 3, count: 0 },
            { star: 2, count: 0 },
            { star: 1, count: 0 }
          ];
          
          feedbackList.forEach(item => {
            const ratingIndex = 5 - item.rating;
            if (ratingIndex >= 0 && ratingIndex < 5) {
              counts[ratingIndex].count++;
            }
          });
          
          setRatingCounts(counts);
        } else {
          setFeedback([]);
          setTotalFeedback(0);
          setAverageRating(0);
          setRatingCounts([
            { star: 5, count: 0 },
            { star: 4, count: 0 },
            { star: 3, count: 0 },
            { star: 2, count: 0 },
            { star: 1, count: 0 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast.error('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [currentUser]);

  // Calculate rating percentage
  const calculatePercentage = (count: number): string => {
    if (totalFeedback === 0) return '0%';
    return `${Math.round((count / totalFeedback) * 100)}%`;
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Statistics</h2>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
                <Star className="h-6 w-6 text-amber-400" />
              </div>
              
              <div className="flex items-end space-x-2">
                <span className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500 text-lg mb-1">/ 5.0</span>
              </div>
              
              <p className="text-gray-500 mt-2">
                Based on {totalFeedback} {totalFeedback === 1 ? 'review' : 'reviews'}
              </p>
              
              <div className="mt-4 h-3 relative max-w-xl rounded-full overflow-hidden">
                <div className="w-full h-full bg-gray-200 absolute"></div>
                <div
                  className="h-full bg-amber-400 absolute transition-all duration-500 ease-out"
                  style={{ width: `${(averageRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Rating Distribution</h3>
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              
              <div className="space-y-3">
                {ratingCounts.map((item) => (
                  <div key={item.star} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-gray-700">
                      {item.star} {item.star === 1 ? 'star' : 'stars'}
                    </div>
                    <div className="flex-1 h-2 mx-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full ${
                          item.star >= 4 ? 'bg-green-500' : 
                          item.star === 3 ? 'bg-amber-500' : 
                          'bg-red-500'
                        } transition-all duration-500 ease-out`}
                        style={{ width: calculatePercentage(item.count) }}
                      ></div>
                    </div>
                    <div className="w-10 text-right text-sm text-gray-600">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recent Feedback */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
              <Activity className="h-5 w-5 text-gray-500" />
            </div>
            
            {feedback.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No feedback received yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Share your feedback code with customers to collect ratings.
                </p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden divide-y divide-gray-200">
                {feedback.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{item.customerName}</span>
                        <span className="text-gray-500 text-sm ml-2">{item.customerNumber}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                    {item.comment && (
                      <p className="text-gray-600 text-sm mt-1">{item.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeStats;