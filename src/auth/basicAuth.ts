export default class BasicAuthentication {
  async login(email: string, password: string) {
    // Store user credentials
    const userData = {
      email,
      password,
      loggedIn: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    return { success: true };
  }

  async logout() {
    localStorage.clear();
    window.location.href = '/';
  }

  isAuthenticated() {
    const userData = localStorage.getItem('userData');
    return !!userData;
  }

  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}
