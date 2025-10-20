import axios from 'axios';
import type { DANGER_ZONE } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Types
interface AddZonePayload {
  type: DANGER_ZONE['type'];
  coordinates: [number, number];
  radius: number;
  description: string;
  area: string;
}

interface ActionPayload {
  zoneId: string;
  actionType: 'document' | 'report' | 'end';
  sessionId: string;
}

// API Functions
export const zonesAPI = {
  // جلب جميع مناطق الخطر
  getAllZones: async (): Promise<DANGER_ZONE[]> => {
    const response = await api.get('/map/zones');
    return response.data;
  },

  // إضافة منطقة خطر جديدة
  addZone: async (zoneData: AddZonePayload): Promise<DANGER_ZONE> => {
    const response = await api.post('/map/addHazard', zoneData);
    return response.data;
  },

  // توثيق منطقة خطر
  documentZone: async (actionData: ActionPayload): Promise<DANGER_ZONE> => {
    const response = await api.post('/map/documentHazard', actionData);
    return response.data;
  },

  // الإبلاغ عن منطقة خطر خاطئة
  reportZone: async (actionData: ActionPayload): Promise<DANGER_ZONE> => {
    const response = await api.post('/map/reportHazard', actionData);
    return response.data;
  },

  // طلب إنهاء الخطر
  endZone: async (actionData: ActionPayload): Promise<DANGER_ZONE> => {
    const response = await api.post('/map/endHazard', actionData);
    return response.data;
  },
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default api;