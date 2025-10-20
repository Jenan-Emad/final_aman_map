import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);

    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getConfig = () => {
    switch (type) {
      case 'success':
        return { 
          bgColor: '#FFFFFF',
          borderColor: '#22C55E', 
          textColor: '#1F2937'
        };
      case 'error':
        return { 
          bgColor: '#FFFFFF',
          borderColor: '#EF4444',
          textColor: '#1F2937'
        };
      case 'warning':
        return { 
          bgColor: '#FFFFFF',
          borderColor: '#F59E0B', 
          textColor: '#1F2937'
        };
      case 'info':
        return { 
          bgColor: '#FFFFFF',
          borderColor: '#3B82F6', 
          textColor: '#1F2937'
        };
      default:
        return { 
          bgColor: '#FFFFFF',
          borderColor: '#6B7280',
          textColor: '#1F2937'
        };
    }
  };

  const config = getConfig();

  return (
    <div 
      className={`modern-toast ${isVisible ? 'toast-enter' : ''} ${isLeaving ? 'toast-exit' : ''}`}
      style={{
        background: config.bgColor,
        color: config.textColor,
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        direction: 'rtl',
        minWidth: '320px',
        maxWidth: '400px',
        fontFamily: 'Cairo, Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        border: `1px solid ${config.borderColor}`,
        borderLeft: `4px solid ${config.borderColor}`,
        position: 'relative',
        marginBottom: '8px',
        transform: 'translateX(-120%)',
        opacity: '0',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ flex: 1 }}>
          {message}
        </div>
        
        {/* زر الإغلاق */}
        <button 
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#9CA3AF';
          }}
        >
          ×
        </button>
      </div>
      
      {/* Progress Bar */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          backgroundColor: config.borderColor,
          borderRadius: '0 0 8px 8px',
          animation: 'progress 4s linear forwards'
        }}
      />
    </div>
  );
};

export default Toast;