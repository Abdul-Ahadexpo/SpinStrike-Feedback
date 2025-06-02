import React, { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { User, Mail, Key, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const EmployeeProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      
      try {
        const employeeRef = ref(database, `employees/${currentUser.id}`);
        const snapshot = await get(employeeRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setName(data.name || '');
          setEmail(currentUser.email || '');
          setPoints(data.points || 0);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Please enter your name');
      return;
    }
    
    // Password validation
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      if (!currentPassword) {
        toast.error('Please enter your current password to change it');
        return;
      }
      
      // Verify current password
      try {
        const employeeRef = ref(database, `employees/${currentUser?.id}`);
        const snapshot = await get(employeeRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.password !== currentPassword) {
            toast.error('Current password is incorrect');
            return;
          }
        } else {
          toast.error('Failed to verify current password');
          return;
        }
      } catch (error) {
        console.error('Error verifying current password:', error);
        toast.error('Failed to verify current password');
        return;
      }
    }
    
    setSaving(true);
    
    try {
      const updates: Record<string, any> = {};
      updates[`employees/${currentUser?.id}/name`] = name;
      
      if (newPassword) {
        updates[`employees/${currentUser?.id}/password`] = newPassword;
      }
      
      await update(ref(database), updates);
      
      toast.success('Profile updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500 mb-4">{email}</p>
              
              <div className="w-full py-3 px-4 bg-primary/10 rounded-md text-center">
                <p className="text-sm text-gray-600">Current Points</p>
                <p className="text-2xl font-bold text-primary">{points} SSP</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-10"
                  placeholder="Your full name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  className="input pl-10 bg-gray-50"
                  disabled
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed. Contact admin if needed.
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input pl-10"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;