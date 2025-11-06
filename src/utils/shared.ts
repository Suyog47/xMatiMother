// Simple toast utility to replace botpress/shared toast
export const toast = {
  success: (message: string) => {
    console.log('✅ SUCCESS:', message);
    alert(`Success: ${message}`);
  },
  failure: (message: string) => {
    console.error('❌ ERROR:', message);
    alert(`Error: ${message}`);
  },
  info: (message: string) => {
    console.info('ℹ️ INFO:', message);
    alert(`Info: ${message}`);
  },
  warning: (message: string) => {
    console.warn('⚠️ WARNING:', message);
    alert(`Warning: ${message}`);
  }
};

// Auth utility
export const auth = {
  setToken: (token: any) => {
    localStorage.setItem('authToken', JSON.stringify(token));
  },
  getToken: () => {
    return JSON.parse(localStorage.getItem('authToken') || '{}');
  },
  clearToken: () => {
    localStorage.removeItem('authToken');
  }
};

// Language utility
export const lang = {
  tr: (key: string, ...args: any[]) => {
    // Simple translation - returns the key for now
    return key;
  }
};

// Confirm dialog utility
export const confirmDialog = async (message: string, options?: any) => {
  return window.confirm(message);
};
