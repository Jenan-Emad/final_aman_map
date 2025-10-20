import NavBar from './components/NavBar';
import MapComponent from './components/MapComponent';
import AboutModal from './components/AboutModal';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.css';
import imagePath from './assets/location-pin.png';
import './App.css';
import type { DANGER_ZONE } from "./types";
// import { REQUIRED_VERIFICATIONS } from "./types";
import { useState, useCallback, useEffect } from 'react';
import { getSessionId, generateId } from './utils/index';
import { canPerformAction } from './utils/verification';
import Toast from './components/Toast';
import 'react-toastify/dist/ReactToastify.css';
import { zonesAPI } from './services/api';
import { fingerprintService } from './services/fingerprint';

// Interface for toast messages
interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

function App() {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [zones, setZones] = useState<DANGER_ZONE[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize fingerprint on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize fingerprint
        await fingerprintService.getDeviceInfo();
        
        // Load existing hazards from backend
        await loadHazards();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showToast('فشل في تحميل البيانات', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load hazards from backend
  const loadHazards = async () => {
    try {
      const hazards = await zonesAPI.getAllHazards();
      setZones(hazards);
    } catch (error) {
      console.error('Error loading hazards:', error);
      showToast('فشل في تحميل مناطق الخطر', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle adding new zone
  const handleAddZone = useCallback(async (newZoneData: Omit<DANGER_ZONE, 'id'>) => {
    const verification = canPerformAction([], getSessionId(), 'add');

    if (!verification.canPerform) {
      showToast(verification.reason || 'لا يمكن إضافة منطقة خطر', 'error');
      return;
    }

    try {
      // Call backend API to add zone
      const result = await zonesAPI.addZone(
        newZoneData.type,
        newZoneData.coordinates,
        newZoneData.radius,
        newZoneData.description
      );

      if (result.success) {
        // Add zone to local state with backend ID
        const newZone: DANGER_ZONE = {
          ...newZoneData,
          id: result.hazardId || generateId()
        };
        
        setZones(prev => [...prev, newZone]);
        showToast('تم إضافة منطقة الخطر بنجاح!', 'success');
        
        // Reload hazards to get updated data
        await loadHazards();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error: any) {
      console.error('Error adding zone:', error);
      showToast('فشل في إضافة منطقة الخطر', 'error');
    }
  }, []);

  // Handle actions on existing zones
  const handleAction = useCallback(async (zoneId: string, actionType: 'document' | 'report' | 'end') => {
    const sessionId = getSessionId();

    // Find the zone
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) {
      showToast('لم يتم العثور على المنطقة', 'error');
      return;
    }

    // Verify action can be performed (client-side check)
    const actionArray = actionType === 'document' ? zone.verificationsByUsers :
                       actionType === 'report' ? zone.reportedByUsers : zone.endRequests;
    
    // Convert to array if it's a number (from backend count)
    const actionArrayAsStrings = typeof actionArray === 'number' 
      ? Array(actionArray).fill(sessionId) 
      : actionArray as string[];

    const verification = canPerformAction(actionArrayAsStrings, sessionId, actionType);

    if (!verification.canPerform) {
      showToast(verification.reason || 'لا يمكن تنفيذ هذا الإجراء', 'error');
      return;
    }

    try {
      // Call backend API
      const result = await zonesAPI.performAction(zoneId, actionType);

      if (result.success) {
        showToast(result.message, 'success');
        
        // Reload hazards to get updated data
        await loadHazards();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error: any) {
      console.error('Error performing action:', error);
      showToast('فشل في تنفيذ الإجراء', 'error');
    }
  }, [zones]);

  const handleAboutClick = useCallback(() => {
    setShowAboutModal(true);
  }, []);

  const handleAboutClose = useCallback(() => {
    setShowAboutModal(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          <p>جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir='rtl' className="aman-map-app">
      <NavBar
        logoName='AmanMap'
        imgSrPath={imagePath}
        onAboutClick={handleAboutClick}
      />
      <MapComponent
        zones={zones}
        onAction={handleAction}
        onAddZone={handleAddZone}
        onShowToast={showToast}
      />

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <AboutModal
        isOpen={showAboutModal}
        onClose={handleAboutClose}
      />

      <AboutSection />
      <Footer />
    </div>
  );
}

export default App;