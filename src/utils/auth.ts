/**
 * Utility function to check if required authentication parameters are present in URL
 * @param location - Location object from React Router
 * @returns boolean - true if all required parameters are present
 */
export const hasRequiredAuthParams = (location: any): boolean => {
  const searchParams = new URLSearchParams(location.search);
  
  try {
    // Check if data parameter exists
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      return false;
    }
    
    // Parse the data parameter
    const decodedData = decodeURIComponent(dataParam);
    const parsedData = JSON.parse(decodedData);
    
    // Check if formData, subData, and token exist within the data object
    const hasFormData = parsedData.formData && parsedData.formData !== '';
    const hasSubData = parsedData.subData && parsedData.subData !== '';
    const hasToken = parsedData.token && parsedData.token !== '';
    
    const isAuthorized = hasFormData && hasSubData && hasToken;
    
    // If authorized, save the parameters to localStorage
    if (isAuthorized) {
      try {
        // Parse the nested JSON strings and save to localStorage
        const formData = JSON.parse(parsedData.formData);
        const subData = JSON.parse(parsedData.subData);
        const token = JSON.parse(parsedData.token);
        
        localStorage.setItem('formData', JSON.stringify(formData));
        localStorage.setItem('subData', JSON.stringify(subData));
        localStorage.setItem('token', JSON.stringify(token));
      } catch (saveError) {
        console.error('Error saving auth params to localStorage:', saveError);
      }
    }
    
    return isAuthorized;
  } catch (error) {
    console.error('Error parsing authentication parameters:', error);
    return false;
  }
};

/**
 * Extract authentication parameters from URL
 * @param location - Location object from React Router
 * @returns object containing the parsed parameters
 */
// export const getAuthParamsFromUrl = (location: any) => {
//   const searchParams = new URLSearchParams(location.search);
  
//   try {
//     // Get the data parameter
//     const dataParam = searchParams.get('data');
//     if (!dataParam) {
//       return {
//         formData: null,
//         subData: null,
//         token: null,
//         isValid: false
//       };
//     }
    
//     // Parse the data parameter
//     const decodedData = decodeURIComponent(dataParam);
//     const parsedData = JSON.parse(decodedData);
    
//     // Extract and parse nested JSON strings
//     const formData = parsedData.formData ? JSON.parse(parsedData.formData) : null;
//     const subData = parsedData.subData ? JSON.parse(parsedData.subData) : null;
//     const token = parsedData.token ? JSON.parse(parsedData.token) : null;
    
//     return {
//       formData,
//       subData,
//       token,
//       isValid: !!(formData && subData && token)
//     };
//   } catch (error) {
//     console.error('Error parsing URL parameters:', error);
//     return {
//       formData: null,
//       subData: null,
//       token: null,
//       isValid: false
//     };
//   }
// };