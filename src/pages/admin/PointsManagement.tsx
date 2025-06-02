import React, { useState, useEffect } from 'react';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { calculatePointsDistribution } from '../../utils/pointsManager';

interface Employee {
  id: string;
  name: string;
  email: string;
  points: number;
}

interface PointsDistribution {
  first?: number;
  second?: number;
  third?: number;
  others?: number;
}

const PointsManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<PointsDistribution>({});
  const [lastReset, setLastReset] = useState<string>('');
  const [resetting, setResetting] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employees
      const employeesRef = ref(database, 'employees');
      const employeesSnapshot = await get(employeesRef);
      
      if (employeesSnapshot.exists()) {
        const data = employeesSnapshot.val();
        const employeeList: Employee[] = [];
        
        Object.keys(data).forEach(key => {
          if (data[key].name) { // Only include if it has a name (valid employee)
            employeeList.push({
              id: key,
              name: data[key].name,
              email: key.replace(/,/g, '.'),
              points: data[key].points || 0
            });
          }
        });
        
        // Sort by points (descending)
        employeeList.sort((a, b) => b.points - a.points);
        setEmployees(employeeList);
      } else {
        setEmployees([]);
      }
      
      // Fetch last reset date
      const resetRef = ref(database, 'points/lastReset');
      const resetSnapshot = await get(resetRef);
      
      if (resetSnapshot.exists()) {
        setLastReset(resetSnapshot.val());
      }
      
      // Calculate points distribution
      const pointsDistribution = await calculatePointsDistribution();
      setDistribution(pointsDistribution);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset all points
  const handleResetAllPoints = async () => {
    if (!confirm('Are you sure you want to reset ALL employee points to zero? This action cannot be undone.')) {
      return;
    }
    
    setResetting(true);
    
    try {
      const updates: Record<string, any> = {};
      
      // Reset employee points
      employees.forEach(employee => {
        updates[`employees/${employee.id}/points`] = 0;
      });
      
      // Update last reset date
      const currentMonth = format(new Date(), 'yyyy-MM');
      updates['points/lastReset'] = currentMonth;
      
      // Perform batch update
      await update(ref(database), updates);
      
      toast.success('All points have been reset successfully');
      fetchData();
    } catch (error) {
      console.error('Error resetting points:', error);
      toast.error('Failed to reset points');
    } finally {
      setResetting(false);
    }
  };

  // Reset individual employee points
  const handleResetEmployeePoints = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reset ${name}'s points to zero?`)) {
      return;
    }
    
    try {
      await set(ref(database, `employees/${id}/points`), 0);
      toast.success(`${name}'s points have been reset`);
      fetchData();
    } catch (error) {
      console.error('Error resetting employee points:', error);
      toast.error('Failed to reset points');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const [year, month] = dateString.split('-');
    return `${month}/${year}`;
  };

  // Calculate next reset date
  const calculateNextResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return format(nextMonth, 'MM/yyyy');
  };

  return (
    <div>
      {/* Points Distribution Summary */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Monthly Points Distribution
          </h2>
          
          <button
            onClick={fetchData}
            className="flex items-center text-sm text-gray-600 hover:text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-amber-50 rounded-lg p-4 border border-gold">
            <h3 className="text-sm font-medium text-gray-700 mb-2">1st Place</h3>
            <p className="text-2xl font-bold text-gray-900">{distribution.first || 0} SSP</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-silver">
            <h3 className="text-sm font-medium text-gray-700 mb-2">2nd Place</h3>
            <p className="text-2xl font-bold text-gray-900">{distribution.second || 0} SSP</p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 border border-bronze">
            <h3 className="text-sm font-medium text-gray-700 mb-2">3rd Place</h3>
            <p className="text-2xl font-bold text-gray-900">{distribution.third || 0} SSP</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Others (each)</h3>
            <p className="text-2xl font-bold text-gray-900">{distribution.others || 0} SSP</p>
          </div>
        </div>
      </div>
      
      {/* Reset Options */}
      <div className="mb-8">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Points Reset</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Last points reset</p>
              <p className="text-lg font-medium text-gray-900">
                {formatDate(lastReset)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Next automatic reset</p>
              <p className="text-lg font-medium text-gray-900">
                {calculateNextResetDate()}
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-amber-700 bg-amber-50 p-4 rounded-md mb-4">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">
                Manual reset will set all employee points to zero. This action cannot be undone.
              </p>
            </div>
            
            <button
              onClick={handleResetAllPoints}
              className="flex items-center btn bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500"
              disabled={resetting}
            >
              {resetting ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Resetting...
                </span>
              ) : (
                <span className="flex items-center">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Points
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Employees Points */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Employee Points
        </h2>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No employees found.</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee, index) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {index === 0 ? (
                          <span className="flex items-center text-gold">
                            1st <span className="ml-1 text-xs">🏆</span>
                          </span>
                        ) : index === 1 ? (
                          <span className="flex items-center text-silver">
                            2nd <span className="ml-1 text-xs">🥈</span>
                          </span>
                        ) : index === 2 ? (
                          <span className="flex items-center text-bronze">
                            3rd <span className="ml-1 text-xs">🥉</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">{index + 1}th</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.points} SSP
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleResetEmployeePoints(employee.id, employee.name)}
                        className="text-gray-600 hover:text-primary"
                      >
                        Reset Points
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsManagement;