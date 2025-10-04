// API Test Utility - helps debug import issues
import * as API from '../services/api';

export const testAPIImports = () => {
  console.log('=== API Import Test ===');
  
  const expectedAPIs = [
    'authAPI',
    'dashboardAPI', 
    'projectsAPI',
    'usersAPI',
    'attendanceAPI',
    'leavesAPI',
    'paymentsAPI',
    'hostingAPI',
    'rolesAPI',
    'permissionsAPI',
    'lookupsAPI',
    'quotationsAPI'
  ];
  
  const results = {};
  
  expectedAPIs.forEach(apiName => {
    const apiExists = API[apiName] !== undefined;
    results[apiName] = apiExists;
    
    if (apiExists) {
      console.log(`✅ ${apiName} - Available`);
    } else {
      console.error(`❌ ${apiName} - Missing`);
    }
  });
  
  console.log('=== Available APIs ===');
  console.log(Object.keys(API));
  
  console.log('=== Test Results ===');
  console.log(results);
  
  return results;
};

// Test specific API methods
export const testAPIMethod = (apiName, methodName) => {
  try {
    const api = API[apiName];
    if (!api) {
      console.error(`API ${apiName} not found`);
      return false;
    }
    
    const method = api[methodName];
    if (!method) {
      console.error(`Method ${methodName} not found in ${apiName}`);
      return false;
    }
    
    console.log(`✅ ${apiName}.${methodName} - Available`);
    return true;
  } catch (error) {
    console.error(`❌ Error testing ${apiName}.${methodName}:`, error);
    return false;
  }
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  // Run test after a short delay to ensure all imports are loaded
  setTimeout(() => {
    testAPIImports();
  }, 1000);
}
