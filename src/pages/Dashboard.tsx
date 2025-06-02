import React, { useEffect, useState } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../firebase/config';
import { Trophy, Award, Medal } from 'lucide-react';
import { checkAndResetMonthlyPoints } from '../utils/pointsManager';

interface Employee {
  id: string;
  name: string;
  email: string;
  points: number;
}

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if points need to be reset for the new month
    checkAndResetMonthlyPoints();
    
    // Fetch employees
    const employeesRef = ref(database, 'employees');
    const unsubscribe = onValue(employeesRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const employeeList: Employee[] = [];
          
          // Transform data to array and include the key as id
          Object.keys(data).forEach(key => {
            if (data[key].name) { // Only include if it has a name (valid employee)
              employeeList.push({
                id: key,
                name: data[key].name,
                email: key.replace(/,/g, '.'), // Convert back to actual email format
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
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee data');
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Calculate remaining employees and points distribution
  const remainingEmployees = employees.slice(3);
  const totalRemainingEmployees = remainingEmployees.length;
  
  // Calculate points per remaining employee (if any)
  let pointsPerEmployee = 0;
  if (totalRemainingEmployees > 0) {
    // 100 total - (40 + 30 + 15) = 15 points remaining
    pointsPerEmployee = Math.floor(15 / totalRemainingEmployees);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Leaderboard</h1>
        <p className="text-gray-600">
          Top performers recognized with SpinStrike Points (SSP)
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
          {error}
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Employees Yet</h3>
          <p className="mt-2 text-gray-500">
            Employees will appear here once they are added to the system.
          </p>
        </div>
      ) : (
        <div className="space-y-8 fade-in">
          {/* Top 3 Employees */}
          <div className="grid gap-6 md:grid-cols-3">
            {employees.slice(0, 3).map((employee, index) => {
              // Determine the rank styling
              let rankStyle = "";
              let icon = null;
              let points = 0;
              
              if (index === 0) {
                rankStyle = "gold-border bg-amber-50";
                icon = <Trophy className="h-6 w-6 text-gold" />;
                points = 40;
              } else if (index === 1) {
                rankStyle = "silver-border bg-gray-50";
                icon = <Award className="h-6 w-6 text-silver" />;
                points = 30;
              } else if (index === 2) {
                rankStyle = "bronze-border bg-amber-50";
                icon = <Medal className="h-6 w-6 text-bronze" />;
                points = 15;
              }
              
              return (
                <div key={employee.id} className={`card ${rankStyle} slide-in`} style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {icon}
                        <span className="ml-2 font-bold text-gray-700">
                          {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
                        </span>
                      </div>
                      <div className="px-3 py-1 bg-primary/10 rounded-full text-primary font-medium">
                        {points} SSP
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{employee.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining Employees */}
          {remainingEmployees.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-medium text-gray-900">Other Team Members</h2>
                <p className="text-sm text-gray-500">
                  Each receives {pointsPerEmployee} SSP from the remaining pool
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {remainingEmployees.map((employee, index) => (
                  <li key={employee.id} className="p-4 hover:bg-gray-50 transition-colors slide-in" style={{animationDelay: `${(index + 3) * 0.1}s`}}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                      <div className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium">
                        {pointsPerEmployee} SSP
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Monthly Points Pool Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Monthly SSP Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-1">Total Monthly Pool</p>
                <p className="text-2xl font-bold text-primary">100 SSP</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-1">Distribution</p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">1st Place:</span> 40 SSP<br />
                  <span className="font-medium">2nd Place:</span> 30 SSP<br />
                  <span className="font-medium">3rd Place:</span> 15 SSP<br />
                  <span className="font-medium">Remaining:</span> 15 SSP (shared equally)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;