import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://www.app.xmati.ai/apis';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Version': '100.0.0',    // keeping 100 to bypass version checks
      },
    });
  }

  getAnonymous(config?: any) {
    return this.instance;
  }

  getSecured(config?: any) {
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    return axios.create({
      ...this.instance.defaults,
      ...config,
      headers: {
        ...this.instance.defaults.headers,
        Authorization: `Bearer ${token}`,
        ...(config?.headers || {}),
      },
    });
  }
}

const api = new ApiService();
export default api;
