import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detect emulator vs device quickly. Default to localhost for web/dev.
const DEFAULT_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator -> host machine

export const ApiConfig = {
  baseUrl: DEFAULT_BASE_URL,
};

const api = axios.create({
  baseURL: ApiConfig.baseUrl,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const AuthService = {
  async login(username, password) {
    const resp = await api.post('/api-token-auth/', { username, password });
    if (resp?.data?.token) {
      await AsyncStorage.setItem('authToken', resp.data.token);
      return true;
    }
    return false;
  },
  async logout() {
    await AsyncStorage.removeItem('authToken');
  },
};

export const HortaService = {
  async list() {
    const resp = await api.get('/api/hortas/');
    return Array.isArray(resp.data) ? resp.data : [];
  },
  async create(payload) {
    const resp = await api.post('/api/hortas/', payload);
    return resp.data;
  },
  async detail(id) {
    const resp = await api.get(`/api/hortas/${id}/`);
    return resp.data;
  },
};

export default api;
