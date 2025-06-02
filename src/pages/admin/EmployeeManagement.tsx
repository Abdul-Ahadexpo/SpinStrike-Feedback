import React, { useState, useEffect } from 'react';
import { ref, get, set, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { UserPlus, Trash2, RefreshCw, Edit } from 'lucide-react';
import { toast } from 'react-toastify';

interface Employee {
  id: string;
  name: string;
  email: string;
  password: string;
  points: number;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const employeesRef = ref(database, 'employees');
      const snapshot = await get(employeesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const employeeList: Employee[] = [];
        
        Object.keys(data).forEach(key => {
          employeeList.push({
            id: key,
            name: data[key].name || '',
            email: key.replace(/,/g, '.'),
            password: data[key].password || '',
            points: data[key].points || 0
          });
        });
        
        setEmployees(employeeList);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Format email to be used as a key (replace . with ,)
      const emailKey = email.replace(/\./g, ',');
      
      // Check if employee already exists (when not editing)
      if (!editingId) {
        const employeeRef = ref(database, `employees/${emailKey}`);
        const snapshot = await get(employeeRef);
        
        if (snapshot.exists()) {
          toast.error('An employee with this email already exists');
          setSubmitting(false);
          return;
        }
      }
      
      // Create or update employee
      const employeeData = {
        name,
        password,
        points: editingId ? employees.find(e => e.id === editingId)?.points || 0 : 0
      };
      
      await set(ref(database, `employees/${emailKey}`), employeeData);
      
      toast.success(editingId ? 'Employee updated successfully' : 'Employee added successfully');
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setName(employee.name);
    setEmail(employee.email);
    setPassword(employee.password);
    setEditingId(employee.id);
  };

  const handleDelete = async (id: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}?`)) {
      return;
    }
    
    try {
      await remove(ref(database, `employees/${id}`));
      toast.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Employee' : 'Add New Employee'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Employee name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="employee@example.com"
              disabled={!!editingId}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Password"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </span>
              ) : editingId ? (
                <span className="flex items-center justify-center">
                  <Edit className="h-4 w-4 mr-1" />
                  Update
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </span>
              )}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Employees List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Employees ({employees.length})
          </h2>
          
          <button
            onClick={fetchEmployees}
            className="flex items-center text-sm text-gray-600 hover:text-primary"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No employees found. Add your first employee above.</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.points} SSP</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id, employee.name)}
                        className="text-error hover:text-red-700"
                      >
                        Delete
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

export default EmployeeManagement;