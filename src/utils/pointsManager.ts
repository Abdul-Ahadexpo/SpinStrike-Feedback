import { ref, get, set, update } from 'firebase/database';
import { database } from '../firebase/config';
import { format } from 'date-fns';

// Check if we need to reset the monthly points pool
export const checkAndResetMonthlyPoints = async () => {
  try {
    // Get last reset date
    const lastResetRef = ref(database, 'points/lastReset');
    const snapshot = await get(lastResetRef);
    
    const today = new Date();
    const currentMonth = format(today, 'yyyy-MM');
    
    if (snapshot.exists()) {
      const lastReset = snapshot.val();
      
      // If the last reset was in a different month, we need to reset
      if (lastReset !== currentMonth) {
        await resetMonthlyPoints();
      }
    } else {
      // No last reset found, initialize it
      await set(lastResetRef, currentMonth);
      await initializePointsPool();
    }
  } catch (error) {
    console.error('Error checking monthly points reset:', error);
  }
};

// Initialize points pool
const initializePointsPool = async () => {
  try {
    const pointsRef = ref(database, 'points');
    await set(pointsRef, {
      monthlyTotal: 100,
      lastReset: format(new Date(), 'yyyy-MM')
    });
  } catch (error) {
    console.error('Error initializing points pool:', error);
  }
};

// Reset the monthly points pool
const resetMonthlyPoints = async () => {
  try {
    // Update last reset date
    const updates: Record<string, any> = {};
    updates['points/lastReset'] = format(new Date(), 'yyyy-MM');
    updates['points/monthlyTotal'] = 100;
    
    // Reset all employee points
    const employeesRef = ref(database, 'employees');
    const snapshot = await get(employeesRef);
    
    if (snapshot.exists()) {
      const employees = snapshot.val();
      
      Object.keys(employees).forEach(key => {
        updates[`employees/${key}/points`] = 0;
      });
    }
    
    // Perform batch update
    await update(ref(database), updates);
    
    console.log('Monthly points reset completed');
  } catch (error) {
    console.error('Error resetting monthly points:', error);
  }
};

// Calculate points distribution based on current employees
export const calculatePointsDistribution = async () => {
  try {
    const employeesRef = ref(database, 'employees');
    const snapshot = await get(employeesRef);
    
    if (snapshot.exists()) {
      const employees = snapshot.val();
      const employeeCount = Object.keys(employees).length;
      
      let distribution: Record<string, number> = {};
      
      if (employeeCount >= 1) {
        distribution['first'] = 40;
      }
      
      if (employeeCount >= 2) {
        distribution['second'] = 30;
      }
      
      if (employeeCount >= 3) {
        distribution['third'] = 15;
      }
      
      // Calculate remaining points for others
      if (employeeCount > 3) {
        const remainingEmployees = employeeCount - 3;
        const remainingPoints = 15; // 100 - (40 + 30 + 15)
        const pointsPerEmployee = Math.floor(remainingPoints / remainingEmployees);
        
        distribution['others'] = pointsPerEmployee;
      }
      
      return distribution;
    }
    
    return {};
  } catch (error) {
    console.error('Error calculating points distribution:', error);
    return {};
  }
};