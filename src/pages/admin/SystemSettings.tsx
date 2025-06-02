import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const SystemSettings: React.FC = () => {
  const [monthlyPoolSize, setMonthlyPoolSize] = useState(100);
  const [firstPlacePoints, setFirstPlacePoints] = useState(40);
  const [secondPlacePoints, setSecondPlacePoints] = useState(30);
  const [thirdPlacePoints, setThirdPlacePoints] = useState(15);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settingsRef = ref(database, 'points/settings');
        const snapshot = await get(settingsRef);
        
        if (snapshot.exists()) {
          const settings = snapshot.val();
          if (settings.monthlyPoolSize) setMonthlyPoolSize(settings.monthlyPoolSize);
          if (settings.firstPlacePoints) setFirstPlacePoints(settings.firstPlacePoints);
          if (settings.secondPlacePoints) setSecondPlacePoints(settings.secondPlacePoints);
          if (settings.thirdPlacePoints) setThirdPlacePoints(settings.thirdPlacePoints);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Save settings
  const handleSaveSettings = async () => {
    // Validate settings
    if (firstPlacePoints + secondPlacePoints + thirdPlacePoints > monthlyPoolSize) {
      toast.error('Total points for top 3 places cannot exceed monthly pool size');
      return;
    }
    
    setSaving(true);
    
    try {
      const settingsData = {
        monthlyPoolSize,
        firstPlacePoints,
        secondPlacePoints,
        thirdPlacePoints
      };
      
      await set(ref(database, 'points/settings'), settingsData);
      
      // Also update the current monthlyTotal
      await set(ref(database, 'points/monthlyTotal'), monthlyPoolSize);
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Calculate remaining points
  const remainingPoints = monthlyPoolSize - (firstPlacePoints + secondPlacePoints + thirdPlacePoints);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Points Configuration */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Points Configuration</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="monthlyPoolSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Pool Size
                </label>
                <input
                  id="monthlyPoolSize"
                  type="number"
                  min="1"
                  max="1000"
                  value={monthlyPoolSize}
                  onChange={(e) => setMonthlyPoolSize(Number(e.target.value))}
                  className="input w-full md:w-1/3"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Total SSP available for distribution each month
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstPlacePoints" className="block text-sm font-medium text-gray-700 mb-1">
                    1st Place Points
                  </label>
                  <input
                    id="firstPlacePoints"
                    type="number"
                    min="1"
                    max={monthlyPoolSize}
                    value={firstPlacePoints}
                    onChange={(e) => setFirstPlacePoints(Number(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="secondPlacePoints" className="block text-sm font-medium text-gray-700 mb-1">
                    2nd Place Points
                  </label>
                  <input
                    id="secondPlacePoints"
                    type="number"
                    min="1"
                    max={monthlyPoolSize}
                    value={secondPlacePoints}
                    onChange={(e) => setSecondPlacePoints(Number(e.target.value))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="thirdPlacePoints" className="block text-sm font-medium text-gray-700 mb-1">
                    3rd Place Points
                  </label>
                  <input
                    id="thirdPlacePoints"
                    type="number"
                    min="1"
                    max={monthlyPoolSize}
                    value={thirdPlacePoints}
                    onChange={(e) => setThirdPlacePoints(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Points Distribution Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>1st Place:</div>
                  <div className="font-medium">{firstPlacePoints} SSP</div>
                  
                  <div>2nd Place:</div>
                  <div className="font-medium">{secondPlacePoints} SSP</div>
                  
                  <div>3rd Place:</div>
                  <div className="font-medium">{thirdPlacePoints} SSP</div>
                  
                  <div>Top 3 Total:</div>
                  <div className="font-medium">{firstPlacePoints + secondPlacePoints + thirdPlacePoints} SSP</div>
                  
                  <div>Remaining for Others:</div>
                  <div className="font-medium">{remainingPoints} SSP</div>
                  
                  <div>Total Monthly Pool:</div>
                  <div className="font-medium">{monthlyPoolSize} SSP</div>
                </div>
              </div>
              
              {remainingPoints < 0 && (
                <div className="flex items-start text-error bg-red-50 p-4 rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">
                    Error: Top 3 points total exceeds the monthly pool size by {Math.abs(remainingPoints)} points.
                    Please adjust the values.
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  className="btn btn-primary flex items-center"
                  disabled={saving || remainingPoints < 0}
                >
                  {saving ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* System Information */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                SpinStrike Feedback is configured to automatically reset points at the beginning of each month.
                The system distributes the monthly pool of {monthlyPoolSize} SSP as follows:
              </p>
              
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>1st place employee receives {firstPlacePoints} SSP</li>
                <li>2nd place employee receives {secondPlacePoints} SSP</li>
                <li>3rd place employee receives {thirdPlacePoints} SSP</li>
                <li>
                  Remaining {remainingPoints} SSP are equally distributed among all other employees,
                  rounded down with no decimals
                </li>
                <li>Any leftover points after distribution are deleted</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;