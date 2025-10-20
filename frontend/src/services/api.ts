import axios from 'axios';
import type { DANGER_ZONE } from '../types';
import { fingerprintService } from './fingerprint';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Types for backend requests
interface BackendHazard {
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  dangerType: 'airstrike' | 'artillery' | 'naval_shelling' | 'other';
  colorCode: string;
}

interface BackendDevice {
  ipAddress: string;
  visitorId: string;
}

interface AddHazardRequest {
  hazard: BackendHazard;
  device: BackendDevice;
}

interface HazardActionRequest {
  verificationType: 'document' | 'report' | 'end';
  hazardId: string;
  device: BackendDevice;
}

// Helper function to map frontend type to backend dangerType
const mapFrontendTypeToBackend = (type: DANGER_ZONE['type']): BackendHazard['dangerType'] => {
  const mapping: Record<DANGER_ZONE['type'], BackendHazard['dangerType']> = {
    'bombing': 'airstrike',
    'gunfire': 'artillery',
    'evacuation_area': 'naval_shelling',
    'movement_restriction': 'other'
  };
  return mapping[type] || 'other';
};

// Helper function to get color code
const getColorCode = (type: DANGER_ZONE['type']): string => {
  const colorMapping: Record<DANGER_ZONE['type'], string> = {
    'bombing': '#dc2626',
    'gunfire': '#ea580c',
    'movement_restriction': '#ca8a04',
    'evacuation_area': '#92400e'
  };
  return colorMapping[type] || '#6b7280';
};

// Helper function to map backend type to frontend
const mapBackendTypeToFrontend = (dangerType: string): DANGER_ZONE['type'] => {
  const mapping: Record<string, DANGER_ZONE['type']> = {
    'airstrike': 'bombing',
    'artillery': 'gunfire',
    'naval_shelling': 'evacuation_area',
    'other': 'movement_restriction'
  };
  return mapping[dangerType] || 'bombing';
};

// Helper function to determine zone status
const determineZoneStatus = (hazard: any): DANGER_ZONE['zoneStatus'] => {
  if (hazard.status?.displayStatus === 'Hazard Ended ') {
    return 'removed';
  }
  if (hazard.verificationSummary?.reportCount >= 5) {
    return 'false_report';
  }
  if (hazard.verificationSummary?.endRequestCount >= 5) {
    return 'pending_removal';
  }
  return 'active';
};

// API Functions
export const zonesAPI = {
  // Add new hazard zone
  addZone: async (
    type: DANGER_ZONE['type'],
    coordinates: [number, number],
    radius: number,
    description: string
  ): Promise<{ success: boolean; message: string; hazardId?: string }> => {
    try {
      const deviceInfo = await fingerprintService.getDeviceInfo();
      
      const requestData: AddHazardRequest = {
        hazard: {
          geometry: {
            type: 'Point',
            coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
          },
          dangerType: mapFrontendTypeToBackend(type),
          colorCode: getColorCode(type)
        },
        device: {
          ipAddress: deviceInfo.ipAddress,
          visitorId: deviceInfo.visitorId
        }
      };

      const response = await api.post('/map/addHazard', requestData);
      
      return {
        success: true,
        message: response.data.message || 'تم إضافة منطقة الخطر بنجاح',
        hazardId: response.data.hazardId
      };
    } catch (error: any) {
      console.error('Error adding zone:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل في إضافة منطقة الخطر'
      };
    }
  },

  // Perform action on existing hazard (document, report, end)
  performAction: async (
    hazardId: string,
    actionType: 'document' | 'report' | 'end'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const deviceInfo = await fingerprintService.getDeviceInfo();
      
      const requestData: HazardActionRequest = {
        verificationType: actionType,
        hazardId: hazardId,
        device: {
          ipAddress: deviceInfo.ipAddress,
          visitorId: deviceInfo.visitorId
        }
      };

      const response = await api.post('/map/hazardAction', requestData);
      
      return {
        success: true,
        message: response.data.message || 'تم تنفيذ الإجراء بنجاح'
      };
    } catch (error: any) {
      console.error('Error performing action:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'فشل في تنفيذ الإجراء'
      };
    }
  },

  // Get all hazards
  getAllHazards: async (): Promise<DANGER_ZONE[]> => {
    try {
      const response = await api.get('/map/hazards');
      
      const hazardsArray = response.data.data || [];
      
      // Check if it's an array
      if (!Array.isArray(hazardsArray)) {
        console.error('Expected array but got:', hazardsArray);
        return [];
      }
      
      // Transform backend data to frontend format
      return hazardsArray.map((hazard: any) => ({
        id: hazard._id,
        type: mapBackendTypeToFrontend(hazard.dangerType),
        coordinates: [hazard.geometry.coordinates[1], hazard.geometry.coordinates[0]] as [number, number],
        radius: hazard.radius || 200,
        description: hazard.description || '',
        timestamp: new Date(hazard.updatedAt),
        reportedAt: new Date(hazard.createdAt),
        area: hazard.area || 'غزة',
        isVerified: hazard.status?.documented || false,
        verificationsByUsers: hazard.verificationSummary?.documentCount || 0,
        reportedByUsers: hazard.verificationSummary?.reportCount || 0,
        endRequests: hazard.verificationSummary?.endRequestCount || 0,
        zoneStatus: determineZoneStatus(hazard)
      }));
    } catch (error) {
      console.error('Error fetching hazards:', error);
      return [];
    }
  }
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default api;